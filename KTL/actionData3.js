

//==== KTL ====
actionData = {
    ...actionData,

    worry: {
        tier:0, plane:2, resourceName:"fear", creationVersion: 6,
        progressMaxBase:2, progressMaxIncrease:1,
        expToLevelBase:1e4, expToLevelIncrease:10,
        actionPowerBase:5, actionPowerMult:1, actionPowerMultIncrease:1.3,
        efficiencyBase:.2, isKTL:true,
        unlockCost:0, visible:false, unlocked:false, purchased: true, hasUpstream:false,
        isGenerator:true, generatorTarget:"courage", generatorSpeed:1,
        onCompleteCustom: function() {
            let actionObj = data.actions.worry;
            this.updateMults();

            addResourceTo(data.actions[this.generatorTarget], actionObj.resourceToAdd);

            views.scheduleUpdate('worryExpGained', intToString(actionObj.expToAdd, 2), "textContent")
            views.scheduleUpdate('worryResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")
        },
        updateMults: function () {
            this.updateUpgradeMult();
            let actionObj = data.actions.worry;
            let dataObj = actionData.worry;

            actionObj.progressGain = dataObj.generatorSpeed * (actionObj.efficiency / 100);
            actionObj.actionPower = actionObj.actionPowerBase *
                actionObj.actionPowerMult;
            actionObj.resourceToAdd = actionObj.actionPower * actionObj.upgradeMult * (actionObj.efficiency/100);
            actionObj.expToAddBase = actionObj.resource * (actionObj.efficiency/100);
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
            data.actions[this.generatorTarget].showResourceAdded = actionObj.resourceToAdd;
        },
        updateUpgradeMult:function() {
            let upgradeMult = 1;
            // upgradeMult *= Math.pow(1.5, data.upgrades.glimpseTheWeave.upgradePower);
            data.actions.worry.upgradeMult = upgradeMult;
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[["hope", 0]],
        onCompleteText: {english:Raw.html`
                +<span style="font-weight:bold;" id="worryExpGained">???</span> Exp on this action<br>
                +<span style="font-weight:bold;" id="worryResourceSent">???</span> Bravery is added to Courage.<br>
                `},
        extraInfo: {english:Raw.html`Exp Gain = Fear * Speed.<br>
        Bravery Gain = Action Power * Speed.`},
        actionTriggers: [
            ["info", "text", "Takes 1% of Mana and converts it to exp. Arcane is generated over time."]
        ]
    },

    courage: {
        tier:1, plane:2, resourceName: "bravery", creationVersion: 6,
        progressMaxBase:100, progressMaxIncrease:4,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.2, isKTL:true, purchased: true, showResourceAdded: true,
        unlockCost:0, visible:false, unlocked:false, hasUpstream: false,
        onLevelAtts:[["hope", 10]],
        expAtts:[["valor", 1]],
        efficiencyAtts:[["hope", 0]]
    },
    overclockTargetingTheLich: {
        tier:0, plane:2, creationVersion: 6,
        progressMaxBase:1e29, progressMaxIncrease:2,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.01, isKTL:true,
        unlockCost:0, visible:false, unlocked:false, purchased: true, showResourceAdded:true,
        hideUpstreamLine: true, hasUpstream: false,
        onUnlock: function() {
            let actionObj = data.actions.overclockTargetingTheLich;
            actionObj.resourceToAdd = Math.pow((1+(actionObj.level+1)/10), 3) * actionData.awakenYourGrimoire.manaQuality() * actionObj.upgradeMult;
            actionObj.showResourceAdded = actionObj.resourceToAdd;
        },
        onLevelCustom: function() {
            if(data.upgrades.rememberTheVictories.upgradePower > 0) {
                data.legacyMultKTL *= 1.01;
            }
            let actionObj = data.actions.overclockTargetingTheLich;
            let toAdd = Math.pow((1+actionObj.level/10), 3) * actionData.awakenYourGrimoire.manaQuality() * actionObj.upgradeMult;

            addResourceTo(data.actions.fightTheEvilForces, toAdd);
            actionObj.resourceToAdd = toAdd;
            actionObj.showResourceAdded = toAdd;

        },
        onLevelAtts:[],
        expAtts:[["resonance", 1]],
        efficiencyAtts:[["resonance", 200]],
        extraInfo: {english:Raw.html`When this action levels up, it generates Fight onto Fight the Evil Forces.<br>
        Fight generated: (1 + level/10)^3 * Mana Quality`},
        actionTriggers: [
            ["info", "text", "On Level: Generates Fight (more in info)"],
        ]
    },
    fightTheEvilForces: {
        tier:0, plane:2, resourceName:"fight", creationVersion: 6,
        progressMaxBase:10, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, showResourceAdded:true, maxLevel:200,
        unlockCost:1, visible:false, unlocked:false, isGenerator:true, generatorSpeed:1, hasUpstream: false,
        onUnlock: function() {
            setSliderUI("fightTheEvilForces", "bridgeOfBone", 100);
        },
        updateMults: function() {
            data.actions.fightTheEvilForces.showResourceAdded = 1;
        },
        onLevelAtts:[["hope", -10]],
        expAtts:[],
        efficiencyAtts:[],
        actionTriggers: [
            ["info", "text", "Doom approaches. Hope is snuffed out."],
            ["unlock", "reveal", "bridgeOfBone"]
        ]
    },
    bridgeOfBone: {
        tier:0, plane:2, resourceName:"fight", creationVersion: 6,
        progressMaxBase:10, progressMaxIncrease:1.5,
        expToLevelBase:5, expToLevelIncrease:1,
        efficiencyBase:.1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:5, visible:false, unlocked:false,
        onUnlock: function() {
            data.useAmuletButtonShowing = true;
        },
        onLevelAtts:[["legacy", 1]],
        expAtts:[],
        efficiencyAtts:[["hope", 0]],
        extraInfo:{english:"Gain Legacy = +1 * (1 + level/5) * Legacy Mult, on complete and level."},
        actionTriggers: [
            ["unlock", "addAC", "", 10],
            ["unlock", "addAW", "", 10],
            ["complete", "addLegacy", "bridgeOfBone", 1],
            ["level_5", "reveal", "harvestGhostlyField"]
        ]
    },
    harvestGhostlyField: {
        tier:0, plane:2, resourceName:"fight", creationVersion: 6,
        progressMaxBase:50, progressMaxIncrease:1.5,
        expToLevelBase:5, expToLevelIncrease:1,
        efficiencyBase:.1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:100, visible:false, unlocked:false,
        onLevelAtts:[["legacy", 4]],
        expAtts:[],
        efficiencyAtts:[["hope", 0]],
        extraInfo:{english:"Gain Legacy = +4 * (1 + level/5) * Legacy Mult, on complete and level."},
        actionTriggers: [
            ["unlock", "addAC", "", 10],
            ["unlock", "addAW", "", 10],
            ["complete", "addLegacy", "harvestGhostlyField", 4],
            ["level_4", "reveal", "geyserFields"]
        ]
    },
    geyserFields: {
        tier:0, plane:2, resourceName:"fight", creationVersion: 6,
        progressMaxBase:500, progressMaxIncrease:2,
        expToLevelBase:5, expToLevelIncrease:1,
        efficiencyBase:.1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false,
        onLevelAtts:[["legacy", 9]],
        expAtts:[],
        efficiencyAtts:[["hope", 0]],
        extraInfo:{english:"Gain Legacy = +9 * (1 + level/5) * Legacy Mult, on complete and level."},
        actionTriggers: [
            ["unlock", "addAC", "", 20],
            ["unlock", "addAW", "", 20],
            ["complete", "addLegacy", "geyserFields", 9],
            ["level_6", "reveal", "destroySiegeEngine"]
        ]
    },
    destroySiegeEngine: {
        tier:0, plane:2, resourceName:"fight", creationVersion: 6,
        progressMaxBase:1e5, progressMaxIncrease:2,
        expToLevelBase:5, expToLevelIncrease:1,
        efficiencyBase:.1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:2e5, visible:false, unlocked:false,
        onLevelAtts:[["legacy", 30]],
        expAtts:[],
        efficiencyAtts:[["hope", 0]],
        extraInfo:{english:"Gain Legacy = +30 * (1 + level/5) * Legacy Mult, on complete and level."},
        actionTriggers: [
            ["unlock", "addAC", "", 30],
            ["unlock", "addAW", "", 80],
            ["complete", "addLegacy", "destroySiegeEngine", 30],
            ["level_5", "reveal", "destroyEasternMonolith"]
        ]
    },
    destroyEasternMonolith: {
        tier:1, plane:2, resourceName:"fight", creationVersion: 6, title:"Kill the Lich",
        progressMaxBase:3e10, progressMaxIncrease:15,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, isKTL:true, purchased: true, maxLevel:1,
        unlockCost:1e7, visible:false, unlocked:false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            if(data.actions.destroyEasternMonolith.level === data.actions.destroyEasternMonolith.maxLevel) {
                document.getElementById("legacySeveranceButton1").style.display = "";
            }
        },
        onLevelAtts:[["legacy", 500]],
        expAtts:[["resonance", 1]],
        efficiencyAtts:[["hope", 0]],
        extraInfo:{english:"Gain Legacy = +500 * (1 + level/5) * Legacy Mult, on level."},
        actionTriggers: [
            ["info", "text", "On Unlock: Show 7 more upgrades."],
            ["unlock", "addAC", "", 50],
            ["unlock", "addAW", "", 480],
            ["complete", "addLegacy", "destroyEasternMonolith", 500],
            ["level_3", "reveal", "stopDarknessRitual"]
        ],
        extraButton: Raw.html`
            <span class="button" id='legacySeveranceButton1' onclick="openLSMenu()"
                style="display:none;padding:8px 13px;position:absolute;left:460px;top:20px;border: 2px solid #aa0000;border-radius: 5px;
                background-color:#550000;text-shadow: 3px 3px 2px rgba(0, 0, 0, 0.8);color: #ffdddd;box-shadow:0 0 10px 6px rgba(255, 0, 0, 0.7);font-size:26px;" >
            Legacy Severance</span>
        `,
    },
    stopDarknessRitual: {
        tier:1, plane:2, resourceName:"fight", creationVersion: 6,
        progressMaxBase:2e13, progressMaxIncrease:2,
        expToLevelBase:5, expToLevelIncrease:1,
        efficiencyBase:.1, isKTL:true, purchased: false, maxLevel:10,
        unlockCost:2e9, visible:false, unlocked:false,
        onLevelAtts:[["legacy", 60]],
        expAtts:[["resonance", 1]],
        efficiencyAtts:[["hope", 0]],
        extraInfo:{english:"Gain Legacy = +60 * (1 + level/5) * Legacy Mult, on complete and level."},
        actionTriggers: [
            ["unlock", "addAC", "", 80],
            ["unlock", "addAW", "", 1000],
            ["complete", "addLegacy", "stopDarknessRitual", 60],
            ["level_3", "reveal", "protectTheSunstone"]
        ]
    },
    protectTheSunstone: {
        tier:1, plane:2, resourceName:"fight", creationVersion: 6,
        progressMaxBase:2e14, progressMaxIncrease:2,
        expToLevelBase:5, expToLevelIncrease:1,
        efficiencyBase:.1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:2e10, visible:false, unlocked:false,
        onLevelAtts:[["legacy", 100]],
        expAtts:[["resonance", 1]],
        efficiencyAtts:[["hope", 0]],
        extraInfo:{english:"Gain Legacy = +100 * (1 + level/5) * Legacy Mult, on complete and level."},
        actionTriggers: [
            ["unlock", "addAC", "", 130],
            ["unlock", "addAW", "", 1200],
            ["complete", "addLegacy", "protectTheSunstone", 100],
            ["level_3", "reveal", "silenceDeathChanters"]
        ]
    },
    silenceDeathChanters: {
        tier:1, plane:2, resourceName:"fight", creationVersion: 6,
        progressMaxBase:2e16, progressMaxIncrease:2,
        expToLevelBase:5, expToLevelIncrease:1,
        efficiencyBase:.1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:2e11, visible:false, unlocked:false,
        onLevelAtts:[["legacy", 150]],
        expAtts:[["resonance", 1]],
        efficiencyAtts:[["hope", 0]],
        extraInfo:{english:"Gain Legacy = +150 * (1 + level/5) * Legacy Mult, on complete and level."},
        actionTriggers: [
            ["unlock", "addAC", "", 210],
            ["unlock", "addAW", "", 1500],
            ["complete", "addLegacy", "silenceDeathChanters", 150],
            ["level_3", "reveal", "breakFleshBarricade"]
        ]
    },
    breakFleshBarricade: {
        tier:1, plane:2, resourceName:"fight", creationVersion: 6,
        progressMaxBase:2e17, progressMaxIncrease:2,
        expToLevelBase:5, expToLevelIncrease:1,
        efficiencyBase:.1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:2e12, visible:false, unlocked:false,
        onLevelAtts:[["legacy", 210]],
        expAtts:[["resonance", 1]],
        efficiencyAtts:[["hope", 0]],
        extraInfo:{english:"Gain Legacy = +210 * (1 + level/5) * Legacy Mult, on complete and level."},
        actionTriggers: [
            ["unlock", "addAC", "", 340],
            ["unlock", "addAW", "", 1800],
            ["complete", "addLegacy", "silenceDeathChanters", 210],
            ["level_3", "reveal", "conquerTheGatekeepers"]
        ]
    },
    conquerTheGatekeepers: {
        tier:1, plane:2, resourceName:"fight", creationVersion: 6,
        progressMaxBase:2e18, progressMaxIncrease:2,
        expToLevelBase:5, expToLevelIncrease:1,
        efficiencyBase:.1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:2e13, visible:false, unlocked:false,
        onLevelAtts:[["legacy", 340]],
        expAtts:[["resonance", 1]],
        efficiencyAtts:[["hope", 0]],
        extraInfo:{english:"Gain Legacy = +340 * (1 + level/5) * Legacy Mult, on complete and level."},
        actionTriggers: [
            ["unlock", "addAC", "", 550],
            ["unlock", "addAW", "", 2200],
            ["complete", "addLegacy", "silenceDeathChanters", 340],
            ["level_3", "reveal", "unhookSacrificialCages"]
        ]
    },
    unhookSacrificialCages: {
        tier:1, plane:2, resourceName:"fight", creationVersion: 6,
        progressMaxBase:2e19, progressMaxIncrease:2,
        expToLevelBase:5, expToLevelIncrease:1,
        efficiencyBase:.1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:2e14, visible:false, unlocked:false,
        onLevelAtts:[["legacy", 550]],
        expAtts:[["resonance", 1]],
        efficiencyAtts:[["hope", 0]],
        extraInfo:{english:"Gain Legacy = +550 * (1 + level/5) * Legacy Mult, on complete and level."},
        actionTriggers: [
            ["unlock", "addAC", "", 890],
            ["unlock", "addAW", "", 2600],
            ["complete", "addLegacy", "silenceDeathChanters", 550],
            ["level_3", "reveal", "purgeUnholyRelics"]
        ]
    },
    purgeUnholyRelics: {
        tier:1, plane:2, resourceName:"fight", creationVersion: 6,
        progressMaxBase:2e20, progressMaxIncrease:2,
        expToLevelBase:5, expToLevelIncrease:1,
        efficiencyBase:.1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:2e15, visible:false, unlocked:false,
        onLevelAtts:[["legacy", 890]],
        expAtts:[["resonance", 1]],
        efficiencyAtts:[["hope", 0]],
        extraInfo:{english:"Gain Legacy = +890 * (1 + level/5) * Legacy Mult, on complete and level."},
        actionTriggers: [
            ["unlock", "addAC", "", 1440],
            ["unlock", "addAW", "", 3000],
            ["complete", "addLegacy", "silenceDeathChanters", 890],
            ["level_3", "reveal", "destroyWesternMonolith"]
        ]
    },
    destroyWesternMonolith: {
        tier:1, plane:2, resourceName:"fight", creationVersion: 6,
        progressMaxBase:2e22, progressMaxIncrease:15,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, isKTL:true, purchased: true, maxLevel:1,
        unlockCost:2e16, visible:false, unlocked:false,
        onLevelAtts:[["legacy", 10000]],
        expAtts:[["resonance", 1]],
        efficiencyAtts:[["hope", 0]],
        extraInfo:{english:"Gain Legacy = +10000 * (1 + level/5) * Legacy Mult, on complete and level."},
        actionTriggers: [
            ["unlock", "addAC", "", 4000],
            ["unlock", "addAW", "", 5000],
            ["complete", "addLegacy", "silenceDeathChanters", 10000],
            ["level_3", "reveal", "destroyFleshGrowths"]
        ],
        extraButton: Raw.html`
            <span class="button" id='legacySeveranceButton1' onclick="openLSMenu()"
                style="display:none;padding:8px 13px;position:absolute;left:460px;top:20px;border: 2px solid #aa0000;border-radius: 5px;
                background-color:#550000;text-shadow: 3px 3px 2px rgba(0, 0, 0, 0.8);color: #ffdddd;box-shadow:0 0 10px 6px rgba(255, 0, 0, 0.7);font-size:26px;" >
            Legacy Severance</span>
        `,
    },
    destroyFleshGrowths: {
        tier:0, plane:2, resourceName:"fight", creationVersion: 6,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: false, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    crackCorruptedEggs: {
        tier:0, plane:2, resourceName:"fight", creationVersion: 6,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
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
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
}
