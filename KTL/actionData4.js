
//==== plane2 ====
actionData = {
    ...actionData,

    echoKindle: {
        tier:1, plane:1, resourceName:"legacy", creationVersion: 6,
        progressMaxBase:10, progressMaxIncrease:1,
        expToLevelBase:1e10, expToLevelIncrease:1.3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.1,
        efficiencyBase:.1,
        unlockCost:0, visible:false, unlocked:false, purchased: true, hasUpstream:false,
        isGenerator:true, generatorTarget:"resonanceFurnace", generatorSpeed:5,
        onCompleteCustom: function() {
            let actionObj = data.actions.echoKindle;
            this.updateMults();

            addResourceTo(data.actions[this.generatorTarget], actionObj.resourceToAdd);

            views.scheduleUpdate('echoKindleResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")
        },
        updateMults: function () {
            let actionObj = data.actions.echoKindle;

            actionObj.progressGain = this.generatorSpeed * (actionObj.efficiency / 100);
            actionObj.actionPower = actionObj.actionPowerBase *
                actionObj.actionPowerMult;
            actionObj.resourceToAdd = this.actionPowerFunction(actionObj.resource) *
                actionObj.actionPower * actionObj.upgradeMult * (actionObj.efficiency/100);
            actionObj.expToAddBase = actionObj.resourceToAdd;
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
            data.actions[this.generatorTarget].showResourceAdded = actionObj.resourceToAdd;
        },
        actionPowerFunction: function(resource) {
            return resource;
        },
        onLevelAtts:[["cycle", 1]],
        expAtts:[["pulse", 1], ["integration", 1]],
        efficiencyAtts:[["pulse", 500]],
        onCompleteText: {english:Raw.html`
                +<span style="font-weight:bold;" id="echoKindleResourceSent">???</span> Echoes were added to Resonance Furnace.<br>
                `},
        extraInfo: {english:Raw.html`Exp & Echoes gain = Legacy * Action Power. Speed affects both Action Power and Generator Speed.`},
        actionTriggers: [
            ["info", "text", "Generates Echoes using Legacy"]
        ]
    },
    resonanceFurnace: {
        tier:1, plane:1, resourceName:"echoes", creationVersion: 6,
        progressMaxBase:10, progressMaxIncrease:1,
        expToLevelBase:5, expToLevelIncrease:33,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:2,
        efficiencyBase:.05, showResourceAdded:true,
        unlockCost:.25, visible:false, unlocked:false, purchased: true, hasUpstream:false,
        isGenerator:true, generatorTarget:"dissipation", generatorSpeed:10,
        onCompleteCustom: function() {
            let actionObj = data.actions.resonanceFurnace;
            actionData.resonanceFurnace.updateMults();

            addResourceTo(data.actions[this.generatorTarget], actionObj.resourceToAdd);

            views.scheduleUpdate('resonanceFurnaceResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")
        },
        updateMults: function () {
            this.updateUpgradeMult();
            let actionObj = data.actions.resonanceFurnace;
            let dataObj = actionData.resonanceFurnace;

            actionObj.progressGain = dataObj.generatorSpeed * (actionObj.efficiency / 100);
            actionObj.actionPower = actionObj.actionPowerBase *
                actionObj.actionPowerMult;
            actionObj.resourceToAdd = dataObj.actionPowerFunction(actionObj.resource) *
                actionObj.actionPower * actionObj.upgradeMult * (actionObj.efficiency/100);
            actionObj.expToAddBase = actionObj.resourceToAdd;
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
            data.actions[this.generatorTarget].showResourceAdded = actionObj.resourceToAdd;
        },
        actionPowerFunction: function(resource) {
            return resource;
        },
        updateUpgradeMult:function() {
            let upgradeMult = 1;
            upgradeMult *= Math.pow(1.25, data.upgrades.listenToThePast.upgradePower);
            data.actions.resonanceFurnace.upgradeMult = upgradeMult;
        },
        onLevelAtts:[["resonance", 10]],
        expAtts:[["cycle", 1]],
        efficiencyAtts:[["cycle", 500], ["integration", 150]],
        onCompleteText: {english:Raw.html`
            +<span style="font-weight:bold;" id="resonanceFurnaceResourceSent">???</span> Charge was added to Dissipation.<br>
            `},
        extraInfo: {english:Raw.html`Exp & Mana gain = Echoes * Action Power. Speed affects both Action Power and Generator Speed.`},
        actionTriggers: [
            ["unlock", "reveal", "dissipation"]
        ]
    },
    dissipation: {
        tier:1, plane:1, resourceName:"charge", backwardsEfficiency: true, creationVersion: 6,
        progressMaxBase:100, progressMaxIncrease:4,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, showResourceAdded:true,
        unlockCost:2.5, visible:false, unlocked:false, purchased: true, hasUpstream:false,
        onLevelAtts:[["impedance", -1]],
        expAtts:[["resonance", 1]],
        efficiencyAtts:[["impedance", 0]],
        actionTriggers: [
            ["info", "text", "Loses charge, reducing how much goes to Pool Mana. Decreasing the attribute Impedance reduces this effect, resulting in more mana."],
            ["unlock", "reveal", "poolMana"],
            ["unlock", "unlock", "poolMana"],
        ]
    },
    poolMana: {
        tier:0, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:10, progressMaxIncrease:1,
        expToLevelBase:2, expToLevelIncrease:4,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.5,
        efficiencyBase:.15, showResourceAdded:true,
        unlockCost:0, visible:false, unlocked:false, purchased: true, hasUpstream:false,
        isGenerator:true, generatorTarget:"poolMana", generatorSpeed:1,
        onCompleteCustom: function() {
            // let dissipationObj = data.actions.dissipation;
            let actionObj = data.actions.poolMana;
            let dataObj = actionData.poolMana;
            dataObj.updateMults();

            addResourceTo(data.actions[this.generatorTarget], actionObj.resourceToAdd);

            // views.scheduleUpdate('poolManaResourceTaken', intToString(dissipationObj.resource, 2), "textContent")
            views.scheduleUpdate('poolManaResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")

            // dissipationObj.resource = 0;
        },
        updateMults: function () {
            this.updateUpgradeMult();
            let actionObj = data.actions.poolMana;
            let dataObj = actionData.poolMana;

            actionObj.progressGain = dataObj.generatorSpeed * (actionObj.efficiency / 100);
            actionObj.actionPower = actionObj.actionPowerBase *
                actionObj.actionPowerMult;
            actionObj.resourceToAdd = Math.sqrt(data.actions.dissipation.resource) * actionObj.actionPower * (actionObj.efficiency/100) * actionObj.upgradeMult;
            actionObj.expToAddBase = actionObj.resourceToAdd;
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
            data.actions[this.generatorTarget].showResourceAdded = actionObj.resourceToAdd;
        },
        updateUpgradeMult:function() {
            let upgradeMult = 1;
            upgradeMult *= Math.pow(1.5, data.upgrades.channelMore.upgradePower);
            upgradeMult *= Math.pow(1.5, data.upgrades.sparkMoreMana.upgradePower);
            data.actions.poolMana.upgradeMult = upgradeMult;
        },
        onLevelAtts:[["pulse", 5]],
        expAtts:[["amplification", 1], ["integration", 1]],
        efficiencyAtts:[["control", 500]],
        onCompleteText: {english:Raw.html`
<!--                -<span style="font-weight:bold;" id="poolManaResourceTaken">???</span> Spark was taken from Spark Mana, converted to<br>-->
                +<span style="font-weight:bold;" id="poolManaResourceSent">???</span> Mana, added to this action.<br>
                `},
        extraInfo: {english:Raw.html`Exp & Mana gain = sqrt(Charge/10) * Action Power * Speed.`},
        actionTriggers: [
            ["info", "text", "Uses Charge and converts it to Mana."],
            ["level_1", "reveal", "manaExperimentation"],
        ]
    },
    threadArcana: {
        tier:0, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:5, progressMaxIncrease:1,
        expToLevelBase:1e9, expToLevelIncrease:10,
        actionPowerBase:5, actionPowerMult:1, actionPowerMultIncrease:1.5,
        efficiencyBase:.2,
        unlockCost:1e4, visible:false, unlocked:false, purchased: true,
        isGenerator:true, generatorTarget:"prepareSpells", generatorSpeed:1,
        onCompleteCustom: function() {
            let actionObj = data.actions.threadArcana;
            this.updateMults();

            //takes 10% of mana, gives [10% mana^2 * mana quality] exp, generates actionPower arcana
            let resourceTaken = actionObj.resource * calcTierMult(this.tier);

            if (actionObj.resourceToAdd > 0) {
                actionObj.resource -= resourceTaken;
                addResourceTo(data.actions[this.generatorTarget], actionObj.resourceToAdd);
            }

            views.scheduleUpdate('threadArcanaResourceTaken', intToString(resourceTaken, 2), "textContent")
            views.scheduleUpdate('threadArcanaExpGained', intToString(actionObj.expToAdd, 2), "textContent")
            views.scheduleUpdate('threadArcanaResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")
        },
        updateMults: function () {
            this.updateUpgradeMult();
            let actionObj = data.actions.threadArcana;

            actionObj.progressGain = this.generatorSpeed * (actionObj.efficiency / 100);
            actionObj.actionPower = actionObj.actionPowerBase *
                actionObj.actionPowerMult;
            actionObj.resourceToAdd = actionObj.actionPower * actionObj.upgradeMult * (actionObj.efficiency/100);
            let mqToUse = actionData.awakenYourGrimoire.manaQuality();
            mqToUse = mqToUse > 0 ? mqToUse : 1;
            actionObj.expToAddBase = Math.pow(actionObj.resource, 2) * mqToUse * (actionObj.efficiency/100);
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
            data.actions[this.generatorTarget].showResourceAdded = actionObj.resourceToAdd;
        },
        updateUpgradeMult:function() {
            let upgradeMult = 1;
            upgradeMult *= Math.pow(1.5, data.upgrades.glimpseTheWeave.upgradePower);
            upgradeMult *= Math.pow(1.5, data.upgrades.weaveSmallerStrands.upgradePower);
            data.actions.threadArcana.upgradeMult = upgradeMult;
        },
        onLevelAtts:[["archmagery", 2]],
        expAtts:[["archmagery", 1], ["spellcraft", 1], ["resonance", 1]],
        efficiencyAtts:[["archmagery", 300]],
        onCompleteText: {english:Raw.html`
                -<span style="font-weight:bold;" id="threadArcanaResourceTaken">???</span> Mana was taken from this action, converted to<br>
                +<span style="font-weight:bold;" id="threadArcanaExpGained">???</span> Exp on this action<br>
                +<span style="font-weight:bold;" id="threadArcanaResourceSent">???</span> Arcana is added to Prepare Spells.<br>
                `},
        extraInfo: {english:Raw.html`Exp gain = (10% of Mana)^2 * Speed * Mana Quality.<br>
        Arcana gain = Action Power * Speed`},
        actionTriggers: [
            ["info", "text", "Takes 10% of Mana and converts it to exp. This is better with more Mana (see info)."],
            ["info", "text", "Arcane is generated over time."]
        ]
    },

    castingExperience: {
        tier:1, plane:1, resourceName:"exp", creationVersion: 6,
        progressMaxBase:1, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.005,
        unlockCost:0, visible:false, unlocked:false, purchased: true, hasUpstream:false,
        hideUpstreamLine: true,
        onLevelCustom: function () {
            data.legacyMultKTL = Math.pow(1.04, data.actions.castingExperience.level);
        },
        onLevelAtts:[["archmagery", 2], ["spellcraft", 1], ["integration", 1]],
        expAtts:[["wizardry", 1], ["intellect", 1]],
        efficiencyAtts:[["control", 1000]],
        extraInfo: {english:Raw.html`Exp is added whenever a spell is cast, at a rate of (the spell's circle + 1)^4`},
        actionTriggers: [
            ["info", "text", "Gains Exp whenever a spell is cast (see info)"],
            ["info", "text", "Increases Legacy gain in Northern Wastes by x1.04 per level"]
        ]
    },

    manaExperimentation: {
        tier:0, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:1, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:5,
        unlockCost:1, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["pulse", 10]],
        expAtts:[],
        efficiencyAtts:[["integration", 75]],
        actionTriggers: [
            ["level_3", "reveal", "expelMana"],
            ["level_4", "reveal", "spellResearch"],
        ]
    },
    expelMana: {
        tier:0, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:50, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:5,
        unlockCost:100, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["pulse", 10]],
        expAtts:[],
        efficiencyAtts:[["integration", 100]],
        actionTriggers: [
            ["level_1", "reveal", "tightenAura"],
            ["level_2", "reveal", "stretchManaCapacity"],
            ["level_5", "reveal", "focusInwards"],
        ]
    },
    tightenAura: {
        tier:0, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:1e8, progressMaxIncrease:6,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:4,
        unlockCost:5e2, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["control", 5]],
        expAtts:[["amplification", 1], ["concentration", 1]],
        efficiencyAtts:[["integration", 125]],
        actionTriggers: [
            ["level_4", "reveal", "collectDischargedMotes"],
        ]
    },
    collectDischargedMotes: {
        tier:0, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:3e4, progressMaxIncrease:6,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:3,
        unlockCost:1e4, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["wizardry", 10], ["impedance", -1]],
        expAtts:[["archmagery", 1]],
        efficiencyAtts:[["integration", 175]],
        actionTriggers: [
            ["level", "addMaxLevels", "tightenAura", 2],
            ["level_3", "reveal", "condenseAura"],
        ]
    },
    condenseAura: {
        tier:1, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:1e15, progressMaxIncrease:6,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:4,
        unlockCost:1e7, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["control", 10]],
        expAtts:[["amplification", 1], ["concentration", 1]],
        efficiencyAtts:[["integration", 250]],
        actionTriggers: [
            ["level_4", "reveal", "solidifyEdges"],
        ]
    },
    solidifyEdges: {
        tier:1, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:1e12, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.0005, maxLevel:3,
        unlockCost:1e11, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["wizardry", 10], ["impedance", -1]],
        expAtts:[["archmagery", 1]],
        efficiencyAtts:[["integration", 350]],
        actionTriggers: [
            ["level", "addMaxLevels", "condenseAura", 1]
        ]
    },
    modifyAuraDensity: {
        tier:1, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:1e30, progressMaxIncrease:21,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:4,
        unlockCost:1e18, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["control", 10]],
        expAtts:[["amplification", 1], ["concentration", 1]],
        efficiencyAtts:[["integration", 600]],
        actionTriggers: [
            ["level_4", "reveal", "layerAura"],
            ["level_6", "reveal", "condenseMana"],
        ]
    },
    layerAura: {
        tier:1, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:1e24, progressMaxIncrease:15,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:10,
        unlockCost:1e22, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["wizardry", 10], ["impedance", -1]],
        expAtts:[["archmagery", 1]],
        efficiencyAtts:[["integration", 900]],
        actionTriggers: [
            ["level", "addMaxLevels", "modifyAuraDensity", 1],
        ]
    },
    stretchManaCapacity: {
        tier:0, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:1e2, progressMaxIncrease:6,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:5,
        unlockCost:1e3, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["amplification", 10]],
        expAtts:[],
        efficiencyAtts:[["integration", 175]],
        actionTriggers: [
        ]
    },
    widenChannels: {
        tier:1, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:1e10, progressMaxIncrease:15,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.0005, maxLevel:5,
        unlockCost:1e10, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["amplification", 10]],
        expAtts:[["spellcraft", 1]],
        efficiencyAtts:[["integration", 400]],
        actionTriggers: [
            ["level", "addMaxLevels", "focusInwards", 1],
            ["level", "addMaxLevels", "stretchManaCapacity", 2],
        ]
    },
    condenseMana: {
        tier:1, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:1e29, progressMaxIncrease:15,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:5,
        unlockCost:1e25, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["amplification", 10]],
        expAtts:[["archmagery", 1]],
        efficiencyAtts:[["integration", 1000]],
        actionTriggers: [
            ["level", "addMaxLevels", "widenChannels", 1],
            ["level_4", "reveal", "spinMana"],
            ["level_8", "reveal", "accelerateManaFlow"],
            ["level_12", "reveal", "loopTheCircuit"],
        ]
    },
    spinMana: {
        tier:2, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:1e48, progressMaxIncrease:60,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.00001, maxLevel:1,
        unlockCost:3e29, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["cycle", 3]],
        expAtts:[["amplification", 1], ["archmagery", 1]],
        efficiencyAtts:[["integration", 1200]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "condenseMana", 5],
            ["level", "addMaxLevels", "accelerateManaFlow", 1],
        ]
    },
    accelerateManaFlow: {
        tier:1, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:3e49, progressMaxIncrease:45,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.00001, maxLevel:0,
        unlockCost:3e32, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["cycle", 3]],
        expAtts:[["amplification", 1], ["archmagery", 1]],
        efficiencyAtts:[["integration", 1300]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "condenseMana", 5],
            ["level", "addMaxLevels", "loopTheCircuit", 1],
        ]
    },
    loopTheCircuit: {
        tier:3, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:9e50, progressMaxIncrease:30,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.00001, maxLevel:0,
        unlockCost:3e35, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["cycle", 3]],
        expAtts:[["amplification", 1], ["archmagery", 1]],
        efficiencyAtts:[["integration", 1400]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "condenseMana", 5],
            ["level", "addMaxLevels", "spinMana", 1],
        ]
    },
    focusInwards: {
        tier:1, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:1e16, progressMaxIncrease:15,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:5,
        unlockCost:1e6, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["pulse", 10]],
        expAtts:[["observation", 1], ["integration", 1]],
        efficiencyAtts:[["integration", 200]],
        actionTriggers: [
            ["level_5", "reveal", "widenChannels"],
            ["level_10", "reveal", "createAVoid"]
        ]
    },
    createAVoid: {
        tier:1, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:3e22, progressMaxIncrease:18,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:10,
        unlockCost:1e12, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["wizardry", 10], ["amplification", 10]],
        expAtts:[["awareness", 1]],
        efficiencyAtts:[["integration", 500]],
        actionTriggers: [
            ["level_10", "reveal", "hearThePulse"],
        ]
    },
    hearThePulse: {
        tier:2, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:1e30, progressMaxIncrease:27,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:5,
        unlockCost:1e22, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["archmagery", 10], ["pulse", 10]],
        expAtts:[["concentration", 1]],
        efficiencyAtts:[["integration", 700]],
        actionTriggers: [
            ["level_3", "reveal", "findTheThread"],
        ]
    },
    findTheThread: {
        tier:2, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:1e44, progressMaxIncrease:36,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:5,
        unlockCost:1e25, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["archmagery", 10], ["pulse", 10]],
        expAtts:[["observation", 1]],
        efficiencyAtts:[["integration", 800]],
        actionTriggers: [
            ["level_1", "reveal", "isolateRhythms"],
        ]
    },
    isolateRhythms: {
        tier:2, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:1e35, progressMaxIncrease:48,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:5,
        unlockCost:1e26, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["pulse", 10], ["archmagery", 10]],
        expAtts:[["awareness", 1]],
        efficiencyAtts:[["integration", 900]],
        actionTriggers: [
            ["level_1", "reveal", "matchTempo"],
        ]
    },
    matchTempo: {
        tier:2, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:1e39, progressMaxIncrease:60,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:5,
        unlockCost:1e28, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["pulse", 10], ["archmagery", 10]],
        expAtts:[["concentration", 1]],
        efficiencyAtts:[["integration", 950]],
        actionTriggers: [
        ]
    },
    practiceIncantations: {
        tier:2, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:1e38, progressMaxIncrease:60,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.00001, maxLevel:3,
        unlockCost:1e33, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["control", 5]],
        expAtts:[["cycle", 1]],
        efficiencyAtts:[["integration", 1300]],
        actionTriggers: [
            ["info", "text", "Each level increases Mana Quality by another +100%"],
            ["level_3", "reveal", "practicePronunciation"],
        ]
    },
    practicePronunciation: {
        tier:2, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:1e42, progressMaxIncrease:15,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.00001, maxLevel:7,
        unlockCost:1e37, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["spellcraft", 5]],
        expAtts:[["cycle", 1]],
        efficiencyAtts:[["integration", 1400]],
        actionTriggers: [
            ["level", "addMaxLevels", "practiceIncantations", 1],
        ]
    },
    practiceGestures: {
        tier:2, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:1e11, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:3,
        unlockCost:1, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["control", 5], ["spellcraft", 5]],
        expAtts:[],
        efficiencyAtts:[["integration", 50]],
        actionTriggers: [
            ["level_1", "reveal", "practiceVisualizations"],
        ]
    },
    practiceVisualizations: {
        tier:2, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:1e12, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:3,
        unlockCost:1, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[["integration", 50]],
        actionTriggers: [
            ["level", "addMaxLevels", "practiceGestures", 1],
        ]
    },
    practiceTargeting: {
        tier:2, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:1e15, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:3,
        unlockCost:1, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["control", 5], ["spellcraft", 5]],
        expAtts:[],
        efficiencyAtts:[["integration", 50]],
        actionTriggers: [
            ["level_1", "reveal", "practiceLayering"],
        ]
    },
    practiceLayering: {
        tier:2, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:1e16, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:3,
        unlockCost:1, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["pulse", 2]],
        expAtts:[],
        efficiencyAtts:[["integration", 50]],
        actionTriggers: [
            ["level", "addMaxLevels", "practiceTargeting", 1],
        ]
    },
    spellResearch: {
        tier:1, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:100, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:7,
        unlockCost:200, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["amplification", 20]],
        expAtts:[],
        efficiencyAtts:[["integration", 125]],
        actionTriggers: [
            ["level_1", "reveal", "awakenYourGrimoire"],
            ["level_1", "reveal", "bindThePages"],
            ["level_2", "reveal", "etchTheCircle"],
            ["level_5", "reveal", "infuseTheHide"],
            ["level_7", "reveal", "grimoireResearch"],
        ]
    },
    awakenYourGrimoire: {
        tier:1, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:1e5, progressMaxIncrease:1e7,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:0,
        unlockCost:1e3, visible:false, unlocked:false, purchased: true,
        manaQuality: function() {
            return data.actions.awakenYourGrimoire.level
                * (data.actions.fixTheFormula.level+1)
                * (data.actions.grimoireResearch.level+1)
                * (data.actions.practiceIncantations.level+1);
        },
        onUnlock: function() {
            checkGrimoireUnlocks()
        },
        onLevelCustom: function () {
            checkGrimoireUnlocks()
        },
        onLevelAtts:[["archmagery", 10]],
        expAtts:[["wizardry", 1], ["archmagery", 1], ["spellcraft", 1]],
        efficiencyAtts:[["integration", 200]],
        actionTriggers: [
            ["info", "text", "Unlock: Reveals arcana, internal spell preparation, and 1 0th Circle Spell"],
            ["info", "text", "Level 1: Reveals 1st Circle Spells (2 to reveal. Requires Ancient Whisper purchase for the second.)"],
            ["info", "text", "Level 2: Reveals purchased 2nd Circle Spell"],
            ["info", "text", "Level 3: Reveals purchased 3rd Circle Spells"],
            ["info", "text", "Level 4: Reveals purchased 4th Circle Spells"],
        ]
    },
    grimoireResearch: {
        tier:1, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:3e7, progressMaxIncrease:27,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:3,
        unlockCost:1e7, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["wizardry", 10]],
        expAtts:[["archmagery", 1], ["spellcraft", 1]],
        efficiencyAtts:[["integration", 300]],
        actionTriggers: [
            ["info", "text", "On Level: Increase Mana Quality +100%"],
            ["level_3", "reveal", "castToFail"],
            ["level_5", "reveal", "locateWeakness"],
            ["level_7", "reveal", "fixTheFormula"],
            ["level_7", "reveal", "boldenLines"],
            ["level_14", "reveal", "grindPigments"],
            ["level_18", "reveal", "chargeInk"],
        ]
    },
    etchTheCircle: {
        tier:0, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:1e3, progressMaxIncrease:1e5,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:1,
        unlockCost:1e3, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[],
        expAtts:[["archmagery", 1], ["spellcraft", 1]],
        efficiencyAtts:[["integration", 200]],
        actionTriggers: [
            ["level", "addMaxLevels", "awakenYourGrimoire", 1],
        ]
    },
    bindThePages: {
        tier:0, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:25, progressMaxIncrease:1.2,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:30,
        unlockCost:6e2, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["wizardry", 2]],
        expAtts:[["archmagery", 1]],
        efficiencyAtts:[["integration", 175]],
        actionTriggers: [
            // ["level_1", "reveal", "feelYourMana"],
        ]
    },
    infuseTheHide: {
        tier:1, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:5e3, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:2,
        unlockCost:5e3, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[],
        expAtts:[["spellcraft", 1]],
        efficiencyAtts:[["integration", 200]],
        actionTriggers: [
            ["level", "addMaxLevels", "bindThePages", 10],
        ]
    },
    boldenLines: {
        tier:1, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:1e26, progressMaxIncrease:45,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:5,
        unlockCost:1e21, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["wizardry", 10], ["archmagery", 3]],
        expAtts:[["concentration", 1], ["spellcraft", 1]],
        efficiencyAtts:[["integration", 600]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "etchTheCircle", 1],
            ["unlock", "addMaxLevels", "infuseTheHide", 2],
            ["level", "addMaxLevels", "grimoireResearch", 1]
        ]
    },
    grindPigments: {
        tier:1, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:3e30, progressMaxIncrease:27,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:5,
        unlockCost:1e23, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["amplification", 10], ["pulse", 10]],
        expAtts:[["wizardry", 1], ["cycle", 1]],
        efficiencyAtts:[["integration", 800]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "infuseTheHide", 2],
            ["level", "addMaxLevels", "boldenLines", 1],
        ]
    },
    chargeInk: {
        tier:2, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:1e34, progressMaxIncrease:1e4,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.0001,
        unlockCost:1e27, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["wizardry", 10], ["archmagery", 10]],
        expAtts:[["spellcraft", 1], ["resonance", 1]],
        efficiencyAtts:[["integration", 1100]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "etchTheCircle", 1],
            ["level", "addMaxLevels", "etchTheCircle", 1],
            ["level_2", "reveal", "practiceIncantations"],
        ]
    },

    castToFail: {
        tier:1, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:3e12, progressMaxIncrease:15,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:0,
        unlockCost:3e11, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["archmagery", 10]],
        expAtts:[["wizardry", 1]],
        efficiencyAtts:[["integration", 325]],
        actionTriggers: [
            ["info", "text", "Gains a max level with every new unlocked spell"],
            ["level", "addMaxLevels", "grimoireResearch", 1],
            ["level", "addMaxLevels", "locateWeakness", 2],
        ]
    },
    locateWeakness: {
        tier:0, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:3e22, progressMaxIncrease:21,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:2,
        unlockCost:1e14, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["spellcraft", 5]],
        expAtts:[["archmagery", 1], ["spellcraft", 1]],
        efficiencyAtts:[["integration", 500]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "etchTheCircle", 1],
            ["level", "addMaxLevels", "fixTheFormula", 1],
        ]
    },
    fixTheFormula: {
        tier:2, plane:1, resourceName:"mana", creationVersion: 6,
        progressMaxBase:1e19, progressMaxIncrease:45,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:1,
        unlockCost:3e17, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["wizardry", 10]],
        expAtts:[["archmagery", 1], ["spellcraft", 1]],
        efficiencyAtts:[["integration", 550]],
        actionTriggers: [
            ["info", "text", "On Level: Increase Awaken Your Grimoire +100%"],
            ["level_1", "reveal", "modifyAuraDensity"],
        ]
    },

    //arcana

    prepareSpells: {
        tier:0, plane:1, resourceName:"arcana", creationVersion: 6,
        progressMaxBase:3, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:3, showResourceAdded:true,
        unlockCost:10, visible:false, unlocked:false, purchased: true, hasUpstream:false,
        onLevelAtts:[["pulse", 10]],
        expAtts:[],
        efficiencyAtts:[["archmagery", 20]],
        actionTriggers: [
            // ["level_1", "reveal", "feelYourMana"],
        ]
    },
    prepareInternalSpells: {
        tier:0, plane:1, resourceName:"arcana", creationVersion: 6,
        progressMaxBase:9, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:3,
        unlockCost:20, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["pulse", 10]],
        expAtts:[],
        efficiencyAtts:[["archmagery", 30]],
        actionTriggers: [
            // ["level_1", "reveal", "feelYourMana"],
        ]
    },
    prepareExternalSpells: {
        tier:0, plane:1, resourceName:"arcana", creationVersion: 6,
        progressMaxBase:1, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:3,
        unlockCost:1, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        actionTriggers: [
            // ["level_1", "reveal", "feelYourMana"],
        ]
    },
    prepareSupportSpells: {
        tier:0, plane:1, resourceName:"arcana", creationVersion: 6,
        progressMaxBase:1, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:3,
        unlockCost:1, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        actionTriggers: [
            // ["level_1", "reveal", "feelYourMana"],
        ]
    },

    castDirtMagic: {
        tier:0, plane:1, resourceName:"arcana", creationVersion: 6,
        progressMaxBase:1, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:3,
        unlockCost:1, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        actionTriggers: [
            // ["level_1", "reveal", "feelYourMana"],
        ]
    },
    castIronMagic: {
        tier:0, plane:1, resourceName:"arcana", creationVersion: 6,
        progressMaxBase:1, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:3,
        unlockCost:1, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        actionTriggers: [
            // ["level_1", "reveal", "feelYourMana"],
        ]
    },
    castRecoverMagic: {
        tier:0, plane:1, resourceName:"arcana", creationVersion: 6,
        progressMaxBase:1, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:3,
        unlockCost:1, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        actionTriggers: [
            // ["level_1", "reveal", "feelYourMana"],
        ]
    },
    castPracticalMagic: {
        tier:0, plane:1, resourceName:"arcana", creationVersion: 6,
        progressMaxBase:1, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:3,
        unlockCost:1, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        actionTriggers: [
            // ["level_1", "reveal", "feelYourMana"],
        ]
    },

    overcharge: {
        tier:0, plane:1, resourceName:"arcana", creationVersion: 6,
        progressMaxBase:1, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1, circle:0,
        efficiencyBase:.2, maxLevel:2, isSpell:true, instabilityToAdd:2, school:"internal",
        unlockCost:30, visible:false, unlocked:false, purchased: true,
        spellPower: function() {
            return 10;
        },
        onLevelAtts:[],
        expAtts:[["spellcraft", 1]],
        efficiencyAtts:[["archmagery", 50]],
        extraInfo: {english:Raw.html`If a charge is available, Overclock has x10 action power. Uses a charge when Overclock completes.`},
        actionTriggers: [
            ["info", "text", "Uses charges to increase Momentum (check info)"],
            ["unlock", "addMaxLevels", "castToFail", 1]
        ]
    },
    overboost: {
        tier:0, plane:1, resourceName:"arcana", creationVersion: 6,
        progressMaxBase:3e5, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1, circle:2,
        efficiencyBase:.05, maxLevel:2, isSpell:true, instabilityToAdd:25,
        unlockCost:3e7, visible:false, unlocked:false, purchased: false, school:"internal",
        spellPower: function() {
            return 10;
        },
        onLevelAtts:[],
        expAtts:[["spellcraft", 1]],
        efficiencyAtts:[["archmagery", 450]],
        extraInfo: {english:Raw.html`If a charge of this action and Overcharge is available, Overclock has x10 action power, stacking with Overcharge. Uses a charge when Overclock completes.`},
        actionTriggers: [
            ["info", "text", "Uses charges to increase Momentum (check info)"],
            ["unlock", "addMaxLevels", "castToFail", 1],
        ]
    },
    overponder: {
        tier:0, plane:1, resourceName:"arcana", creationVersion:7,
        progressMaxBase:1e11, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1, circle:7,
        efficiencyBase:.02, maxLevel:2, isSpell:true, instabilityToAdd:90,
        unlockCost:1e14, visible:false, unlocked:false, purchased: false, school:"internal",
        spellPower: function() {
            return 10;
        },
        onLevelAtts:[],
        expAtts:[["spellcraft", 1]],
        efficiencyAtts:[["archmagery", 900]],
        extraInfo: {english:Raw.html`If a charge of this action, Overcharge, and Overboost is available, Overclock has x10 action power, stacking with Overboost and Overcharge. Uses a charge when Overclock completes.`},
        actionTriggers: [
            ["info", "text", "Uses charges to increase Momentum (check info)"],
            ["unlock", "addMaxLevels", "castToFail", 1],
        ]
    },

    overwork: { //x5 base, x3 instab,
        tier:0, plane:1, resourceName:"arcana", creationVersion: 6,
        progressMaxBase:5, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1, circle:1,
        efficiencyBase:.2, maxLevel:2, isSpell:true, instabilityToAdd:8,
        unlockCost:200, visible:false, unlocked:false, purchased: true, school:"internal",
        spellPower: function() {
            return 10;
        },
        onLevelAtts:[],
        expAtts:[["spellcraft", 1]],
        efficiencyAtts:[["archmagery", 100]],
        extraInfo: {english:Raw.html`If a charge is available, Make Money has x10 action power. Uses a charge when Make Money completes.`},
        actionTriggers: [
            ["info", "text", "Uses charges to increase Coins (check info)"],
            ["unlock", "addMaxLevels", "castToFail", 1]
        ]
    },
    overproduce: {
        tier:0, plane:1, resourceName:"arcana", creationVersion: 6,
        progressMaxBase:15e5, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1, circle:3,
        efficiencyBase:.05, maxLevel:2, isSpell:true, instabilityToAdd:40,
        unlockCost:1e10, visible:false, unlocked:false, purchased: false, school:"internal",
        spellPower: function() {
            return 10;
        },
        onLevelAtts:[],
        expAtts:[["spellcraft", 1]],
        efficiencyAtts:[["archmagery", 550]],
        extraInfo: {english:Raw.html`If a charge of this action and Overwork is available, Make Money has x10 action power, stacking with Overwork. Uses a charge when Make Money completes.`},
        actionTriggers: [
            ["info", "text", "Uses charges to increase Coins (check info)"],
            ["unlock", "addMaxLevels", "castToFail", 1],
        ]
    },
    overdrive: {
        tier:0, plane:1, resourceName:"arcana", creationVersion:7,
        progressMaxBase:1e12, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1, circle:8,
        efficiencyBase:.01, maxLevel:2, isSpell:true, instabilityToAdd:150,
        unlockCost:1e12, visible:false, unlocked:false, purchased: false, school:"internal",
        spellPower: function() {
            return 10;
        },
        onLevelAtts:[],
        expAtts:[["spellcraft", 1]],
        efficiencyAtts:[["wizardry", 400]],
        extraInfo: {english:Raw.html`If a charge of this action, Overwork, and Overproduce is available, Make Money has x10 action power, stacking with Overwork and Overproduce. Uses a charge when Make Money completes.`},
        actionTriggers: [
            ["info", "text", "Uses charges to increase Momentum (check info)"],
            ["unlock", "addMaxLevels", "castToFail", 1],
        ]
    },

    overtalk: { //x3 base, x1.5 instab
        tier:0, plane:1, resourceName:"arcana", creationVersion: 6,
        progressMaxBase:15, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1, circle:1,
        efficiencyBase:.2, maxLevel:2, isSpell:true, instabilityToAdd:10,
        unlockCost:3e6, visible:false, unlocked:false, purchased: false, school:"internal",
        spellPower: function() {
            return 10;
        },
        onLevelAtts:[],
        expAtts:[["spellcraft", 1]],
        efficiencyAtts:[["archmagery", 200]],
        extraInfo: {english:Raw.html`If a charge is available, Socialize has x10 action power. Uses a charge when Socialize completes.`},
        actionTriggers: [
            ["info", "text", "Uses charges to increase Conversations (check info)"],
            ["unlock", "addMaxLevels", "castToFail", 1]
        ]
    },
    overhear: {
        tier:0, plane:1, resourceName:"arcana", creationVersion: 6,
        progressMaxBase:45e5, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1, circle:3,
        efficiencyBase:.05, maxLevel:2, isSpell:true, instabilityToAdd:50,
        unlockCost:3e10, visible:false, unlocked:false, purchased: false, school:"internal",
        spellPower: function() {
            return 10;
        },
        onLevelAtts:[],
        expAtts:[["spellcraft", 1]],
        efficiencyAtts:[["archmagery", 600]],
        extraInfo: {english:Raw.html`If a charge of this action and Overtalk is available, Socialize has x10 action power, stacking with Overtalk. Uses a charge when Socialize completes.`},
        actionTriggers: [
            ["info", "text", "Uses charges to increase Conversations (check info)"],
            ["unlock", "addMaxLevels", "castToFail", 1],
        ]
    },
    overhype: {
        tier:0, plane:1, resourceName:"arcana", creationVersion:7,
        progressMaxBase:1e12, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1, circle:8,
        efficiencyBase:.01, maxLevel:2, isSpell:true, instabilityToAdd:200,
        unlockCost:1e12, visible:false, unlocked:false, purchased: false, school:"internal",
        spellPower: function() {
            return 10;
        },
        onLevelAtts:[],
        expAtts:[["spellcraft", 1]],
        efficiencyAtts:[["wizardry", 400]],
        extraInfo: {english:Raw.html`If a charge of this action, Overtalk, and Overhear is available, Socialize has x10 action power, stacking with Overtalk and Overhear. Uses a charge when Socialize completes.`},
        actionTriggers: [
            ["info", "text", "Uses charges to increase Momentum (check info)"],
            ["unlock", "addMaxLevels", "castToFail", 1],
        ]
    },


    createMounds: {
        tier:0, plane:1, resourceName:"arcana", creationVersion: 6,
        progressMaxBase:100, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.4, maxLevel:2, isSpell:true, instabilityToAdd:5, circle:0,
        unlockCost:500, visible:false, unlocked:false, purchased: false, school:"dirt",
        spellPower: function() {
            return 10;
        },
        onLevelAtts:[],
        expAtts:[["spellcraft", 1]],
        efficiencyAtts:[["wizardry", 400]],
        extraInfo: {english:Raw.html``},
        actionTriggers: [
            ["unlock", "addMaxLevels", "castToFail", 1],
            // ["level_1", "reveal", "overponder"]
        ]
    },
    hardenDirt: {
        tier:0, plane:1, resourceName:"arcana", creationVersion: 6,
        progressMaxBase:100, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.4, maxLevel:2, isSpell:true, instabilityToAdd:5, circle:1,
        unlockCost:500, visible:false, unlocked:false, purchased: false, school:"dirt",
        spellPower: function() {
            return 10;
        },
        onLevelAtts:[],
        expAtts:[["spellcraft", 1]],
        efficiencyAtts:[["wizardry", 400]],
        extraInfo: {english:Raw.html``},
        actionTriggers: [
            ["unlock", "addMaxLevels", "castToFail", 1],
            // ["level_1", "reveal", "overponder"]
        ]
    },
    shapeDefenses: {
        tier:0, plane:1, resourceName:"arcana", creationVersion: 6,
        progressMaxBase:100, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.4, maxLevel:2, isSpell:true, instabilityToAdd:5, circle:1,
        unlockCost:500, visible:false, unlocked:false, purchased: false, school:"dirt",
        spellPower: function() {
            return 10;
        },
        onLevelAtts:[],
        expAtts:[["spellcraft", 1]],
        efficiencyAtts:[["wizardry", 400]],
        extraInfo: {english:Raw.html``},
        actionTriggers: [
            ["unlock", "addMaxLevels", "castToFail", 1],
            // ["level_1", "reveal", "overponder"]
        ]
    },
    mendSmallCracks: {
        tier:0, plane:1, resourceName:"arcana", creationVersion: 6,
        progressMaxBase:100, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.4, maxLevel:2, isSpell:true, instabilityToAdd:5, circle:1,
        unlockCost:500, visible:false, unlocked:false, purchased: false, school:"iron",
        spellPower: function() {
            return 10;
        },
        onLevelAtts:[],
        expAtts:[["spellcraft", 1]],
        efficiencyAtts:[["wizardry", 400]],
        extraInfo: {english:Raw.html``},
        actionTriggers: [
            ["unlock", "addMaxLevels", "castToFail", 1],
            // ["level_1", "reveal", "overponder"]
        ]
    },
    restoreEquipment: {
        tier:0, plane:1, resourceName:"arcana", creationVersion: 6,
        progressMaxBase:100, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.4, maxLevel:2, isSpell:true, instabilityToAdd:5, circle:1,
        unlockCost:500, visible:false, unlocked:false, purchased: false, school:"iron",
        spellPower: function() {
            return 10;
        },
        onLevelAtts:[],
        expAtts:[["spellcraft", 1]],
        efficiencyAtts:[["wizardry", 400]],
        extraInfo: {english:Raw.html``},
        actionTriggers: [
            ["unlock", "addMaxLevels", "castToFail", 1],
            // ["level_1", "reveal", "overponder"]
        ]
    },
    reinforceArmor: {
        tier:0, plane:1, resourceName:"arcana", creationVersion: 6,
        progressMaxBase:100, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.4, maxLevel:2, isSpell:true, instabilityToAdd:5, circle:1,
        unlockCost:500, visible:false, unlocked:false, purchased: false, school:"iron",
        spellPower: function() {
            return 10;
        },
        onLevelAtts:[],
        expAtts:[["spellcraft", 1]],
        efficiencyAtts:[["wizardry", 400]],
        extraInfo: {english:Raw.html``},
        actionTriggers: [
            ["unlock", "addMaxLevels", "castToFail", 1],
            // ["level_1", "reveal", "overponder"]
        ]
    },
    unblemish: {
        tier:0, plane:1, resourceName:"arcana", creationVersion: 6,
        progressMaxBase:100, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.4, maxLevel:2, isSpell:true, instabilityToAdd:5, circle:1,
        unlockCost:500, visible:false, unlocked:false, purchased: false, school:"recover",
        spellPower: function() {
            return 10;
        },
        onLevelAtts:[],
        expAtts:[["spellcraft", 1]],
        efficiencyAtts:[["wizardry", 400]],
        extraInfo: {english:Raw.html``},
        actionTriggers: [
            ["unlock", "addMaxLevels", "castToFail", 1],
            // ["level_1", "reveal", "overponder"]
        ]
    },
    lightHeal: {
        tier:0, plane:1, resourceName:"arcana", creationVersion: 6,
        progressMaxBase:100, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.4, maxLevel:2, isSpell:true, instabilityToAdd:5, circle:1,
        unlockCost:500, visible:false, unlocked:false, purchased: false, school:"recover",
        spellPower: function() {
            return 10;
        },
        onLevelAtts:[],
        expAtts:[["spellcraft", 1]],
        efficiencyAtts:[["wizardry", 400]],
        extraInfo: {english:Raw.html``},
        actionTriggers: [
            ["unlock", "addMaxLevels", "castToFail", 1],
            // ["level_1", "reveal", "overponder"]
        ]
    },
    mendAllWounds: {
        tier:0, plane:1, resourceName:"arcana", creationVersion: 6,
        progressMaxBase:100, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.4, maxLevel:2, isSpell:true, instabilityToAdd:5, circle:1,
        unlockCost:500, visible:false, unlocked:false, purchased: false, school:"recover",
        spellPower: function() {
            return 10;
        },
        onLevelAtts:[],
        expAtts:[["spellcraft", 1]],
        efficiencyAtts:[["wizardry", 400]],
        extraInfo: {english:Raw.html``},
        actionTriggers: [
            ["unlock", "addMaxLevels", "castToFail", 1],
            // ["level_1", "reveal", "overponder"]
        ]
    },
    illuminate: {
        tier:0, plane:1, resourceName:"arcana", creationVersion: 6,
        progressMaxBase:100, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.4, maxLevel:2, isSpell:true, instabilityToAdd:5, circle:1,
        unlockCost:500, visible:false, unlocked:false, purchased: false, school:"practical",
        spellPower: function() {
            return 10;
        },
        onLevelAtts:[],
        expAtts:[["spellcraft", 1]],
        efficiencyAtts:[["wizardry", 400]],
        extraInfo: {english:Raw.html``},
        actionTriggers: [
            ["unlock", "addMaxLevels", "castToFail", 1],
            // ["level_1", "reveal", "overponder"]
        ]
    },
    identifyItem: {
        tier:0, plane:1, resourceName:"arcana", creationVersion: 6,
        progressMaxBase:100, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.4, maxLevel:2, isSpell:true, instabilityToAdd:5, circle:1, school:"practical",
        unlockCost:500, visible:false, unlocked:false, purchased: false,
        spellPower: function() {
            return 10;
        },
        onLevelAtts:[],
        expAtts:[["spellcraft", 1]],
        efficiencyAtts:[["wizardry", 400]],
        extraInfo: {english:Raw.html``},
        actionTriggers: [
            ["unlock", "addMaxLevels", "castToFail", 1],
            // ["level_1", "reveal", "overponder"]
        ]
    },
    detectMagic: {
        tier:0, plane:1, resourceName:"arcana", creationVersion: 6,
        progressMaxBase:100, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.4, maxLevel:2, isSpell:true, instabilityToAdd:5, circle:1, school:"practical",
        unlockCost:500, visible:false, unlocked:false, purchased: false,
        spellPower: function() {
            return 10;
        },
        onLevelAtts:[],
        expAtts:[["spellcraft", 1]],
        efficiencyAtts:[["wizardry", 400]],
        extraInfo: {english:Raw.html``},
        actionTriggers: [
            ["unlock", "addMaxLevels", "castToFail", 1],
            // ["level_1", "reveal", "overponder"]
        ]
    },

}
