
//==== plane3 ====
actionData = {
    ...actionData,


    reposeRebounded: {
        tier:3, plane:3, resourceName:"deathEnergy", creationVersion: 6,
        progressMaxBase:60, progressMaxIncrease:1,
        expToLevelBase:1440, expToLevelIncrease:1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.02,
        efficiencyBase:1,
        unlockCost:0, visible:false, unlocked:false, purchased: true, hasUpstream:false,
        isGenerator:true, generatorTarget:"turnTheWheel", generatorSpeed:1,
        onCompleteCustom: function() {
            let actionObj = data.actions.reposeRebounded;
            this.updateMults();

            actionAddExp(data.actions.turnTheWheel, actionObj.resourceToAdd)

            views.scheduleUpdate('reposeReboundedResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")
        },
        updateMults: function () {
            let actionObj = data.actions.reposeRebounded;

            actionObj.progressGain = this.generatorSpeed;
            actionObj.actionPower = actionObj.actionPowerBase *
                actionObj.actionPowerMult;
            actionObj.resourceToAdd = actionObj.resource *
                actionObj.actionPower * actionObj.upgradeMult;
            data.actions[this.generatorTarget].showExpAdded = actionObj.resourceToAdd;
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        onCompleteText: {english:Raw.html`
                +<span style="font-weight:bold;" id="reposeReboundedResourceSent">???</span> exp was added to Turn the Wheel.<br>
                `},
        actionTriggers: [
            ["info", "text", "Adds exp to Turn the Wheel using Death Energy"],
            ["info", "text", "Does not reset on Legacy Severance"],
        ],
        extraInfo: {
            english: Raw.html`Adds exp to Turn the Wheel equal to Death Energy`
        }
    },
    turnTheWheel: {
        tier:2, plane:3, resourceName:"lifeEnergy", creationVersion: 6,
        progressMaxBase:100, progressMaxIncrease:1,
        expToLevelBase:20, expToLevelIncrease:1.2,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.08,
        efficiencyBase:.05, showResourceAdded:true, showExpAdded:true,
        unlockCost:0, visible:false, unlocked:false, purchased: true, hasUpstream:false,
        isGenerator:true, generatorSpeed:10,
        onCompleteCustom: function() {
            let actionObj = data.actions.turnTheWheel;
            this.updateMults();

            addResourceTo(actionObj, actionObj.resourceToAdd);
            addResourceTo(data.actions.tidalBurden, (actionObj.efficiency / 100));
            addResourceTo(data.actions.dipInTheRiver, actionObj.resource / 10);

            views.scheduleUpdate('turnTheWheelResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")
        },
        updateMults: function () {
            let actionObj = data.actions.turnTheWheel;

            actionObj.progressGain = this.generatorSpeed * (actionObj.efficiency / 100);
            actionObj.actionPower = actionObj.actionPowerBase *
                actionObj.actionPowerMult;
            actionObj.resourceToAdd = actionObj.actionPower * actionObj.upgradeMult * (actionObj.efficiency / 100);
            actionObj.expToAddBase = 0;
            actionObj.showResourceAdded = actionObj.resourceToAdd;
            data.actions.tidalBurden.showResourceAdded = actionObj.efficiency/100;
            data.actions.dipInTheRiver.showResourceAdded = actionObj.resource/10;
        },
        onLevelAtts:[["flow", 5]],
        expAtts:[],
        efficiencyAtts:[["continuity", 0], ["flow", 100], ["cycle", 100], ["awareness", 1000]],
        onCompleteText: {english:Raw.html`
                +<span style="font-weight:bold;" id="turnTheWheelResourceSent">???</span> Life Energy was added to this action.<br>
                `},
        actionTriggers: [
            ["info", "text", "Generates Life Energy and Silt"],
            ["info", "text", "Amount resets on Amulet Use"],
            ["info", "text", "Level resets only on Legacy Severance"],
        ],
        extraInfo: {
            english: Raw.html`Generates Life Energy on this action equal to action power * speed<br>
            Generates Essence on Dip in the River equal to Life Energy / 10<br>
            Generates Silt on Tidal Burden equal to speed`
        }
    },
    tidalBurden: {
        tier:2, plane:3, resourceName:"silt", creationVersion: 6,
        progressMaxBase:10, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1, maxLevel: 200,
        efficiencyBase:1, showResourceAdded:true,
        unlockCost:0, visible:false, unlocked:false, purchased: true, hasUpstream:false,
        onLevelAtts:[["continuity", -10]],
        expAtts:[["impedance", 1]],
        efficiencyAtts:[],
        actionTriggers: [
            ["info", "text", "The wheel cannot turn forever."],
        ]
    },
    dipInTheRiver: {
        tier:2, plane:3, resourceName:"essence", creationVersion: 6, title: "Dip in the River",
        progressMaxBase:600, progressMaxIncrease:1.05,
        expToLevelBase:6, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:10, showResourceAdded:true,
        unlockCost:5000, visible:false, unlocked:false, purchased: true, hasUpstream:false,
        onLevelAtts:[["calm", 5]],
        expAtts:[["flow", 1]],
        efficiencyAtts:[["flow", 150]],
        actionTriggers: [
            ["level_2", "reveal", "prepareInfusion"],
        ],
    },
    prepareInfusion: {
        tier:2, plane:3, resourceName:"essence", creationVersion: 6,
        progressMaxBase:300, progressMaxIncrease:1.2,
        expToLevelBase:6, expToLevelIncrease:1,
        efficiencyBase:.01, purchased: true, maxLevel: 5,
        unlockCost:8000, visible:false, unlocked:false,
        onLevelAtts:[["integration", 5]],
        expAtts:[],
        efficiencyAtts:[["flow", 200]],
        actionTriggers: [
            ["level_1", "reveal", "infuseBody"],
            ["level_2", "reveal", "infuseMind"],
            ["level_3", "reveal", "infuseImage"],
            ["level_4", "reveal", "infuseSenses"],
            ["level_5", "reveal", "infuseMagic"],
        ],
    },
    infuseBody: {
        tier:1, plane:3, resourceName:"essence", creationVersion: 6,
        progressMaxBase:120, progressMaxIncrease:1.05,
        expToLevelBase:6, expToLevelIncrease:1,
        efficiencyBase:.1, purchased: true,
        unlockCost:12000, visible:false, unlocked:false,
        onLevelAtts:[["energy", 1], ["endurance", 1], ["might", 1]],
        expAtts:[],
        efficiencyAtts:[["flow", 300]],
        actionTriggers: [
            ["level", "addMaxLevels", "dipInTheRiver", 1]
        ],
    },
    infuseMind: {
        tier:1, plane:3, resourceName:"essence", creationVersion: 6,
        progressMaxBase:240, progressMaxIncrease:1.05,
        expToLevelBase:6, expToLevelIncrease:1,
        efficiencyBase:.1, purchased: true,
        unlockCost:24000, visible:false, unlocked:false,
        onLevelAtts:[["concentration", 1], ["ambition", 1], ["savvy", 1]],
        expAtts:[],
        efficiencyAtts:[["flow", 350]],
        actionTriggers: [
            ["level", "addMaxLevels", "dipInTheRiver", 1]
        ],
    },
    infuseImage: {
        tier:1, plane:3, resourceName:"essence", creationVersion: 6,
        progressMaxBase:480, progressMaxIncrease:1.05,
        expToLevelBase:6, expToLevelIncrease:1,
        efficiencyBase:.1, purchased: true,
        unlockCost:48000, visible:false, unlocked:false, generatorSpeed:1,
        onLevelAtts:[["confidence", 1], ["charm", 1], ["leverage", 1]],
        expAtts:[],
        efficiencyAtts:[["flow", 400]],
        actionTriggers: [
            ["level", "addMaxLevels", "dipInTheRiver", 1]
        ],
    },
    infuseSenses: {
        tier:1, plane:3, resourceName:"essence", creationVersion: 6,
        progressMaxBase:960, progressMaxIncrease:1.05,
        expToLevelBase:6, expToLevelIncrease:1,
        efficiencyBase:.1, purchased: true,
        unlockCost:96000, visible:false, unlocked:false, generatorSpeed:1,
        onLevelAtts:[["awareness", 1], ["observation", 1], ["navigation", 1]],
        expAtts:[],
        efficiencyAtts:[["flow", 450]],
        actionTriggers: [
            ["level", "addMaxLevels", "dipInTheRiver", 1]
        ],
    },
    infuseMagic: {
        tier:1, plane:3, resourceName:"essence", creationVersion: 6,
        progressMaxBase:1920, progressMaxIncrease:1.05,
        expToLevelBase:6, expToLevelIncrease:1,
        efficiencyBase:.1, purchased: true,
        unlockCost:192000, visible:false, unlocked:false, generatorSpeed:1,
        onLevelAtts:[["control", 1], ["amplification", 1], ["pulse", 1]],
        expAtts:[],
        efficiencyAtts:[["flow", 500]],
        actionTriggers: [
            ["level", "addMaxLevels", "dipInTheRiver", 1]
        ],
    },
}