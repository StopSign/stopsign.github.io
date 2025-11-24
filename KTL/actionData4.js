
//==== plane2 ====
actionData = {
    ...actionData,

    echoKindle: {
        tier:0, plane:1, resourceName:"legacy",
        progressMaxBase:10, progressMaxIncrease:1,
        expToLevelBase:10000000, expToLevelIncrease:1.2,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.05,
        efficiencyBase:.008,
        unlockCost:0, visible:false, unlocked:false, purchased: true, hasDeltas: false, hasUpstream:false,
        isGenerator:true, generatorTarget:"sparkMana", generatorSpeed:100,
        onCompleteCustom: function() {
            let actionObj = data.actions.echoKindle;
            actionData.echoKindle.updateMults();

            addResourceTo(data.actions[actionObj.generatorTarget], actionObj.resourceToAdd);

            views.scheduleUpdate('echoKindleResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")
        },
        updateMults: function () {
            let actionObj = data.actions.echoKindle;
            let dataObj = actionData.echoKindle;

            actionObj.progressGain = dataObj.generatorSpeed * (actionObj.efficiency / 100);
            actionObj.actionPower = actionObj.actionPowerBase *
                actionObj.actionPowerMult * (actionObj.efficiency/100);
            actionObj.resourceToAdd = dataObj.actionPowerFunction(actionObj.resource) * actionObj.tierMult() *
                actionObj.actionPower * actionObj.upgradeMult;
            actionObj.expToAddBase = actionObj.resourceToAdd;
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
        },
        actionPowerFunction: function(resource) {
            if(resource < 1) {
                return 0;
            }
            return Math.pow(resource, .5) * 1000;
        },
        onLevelAtts:[["pulse", 5]],
        expAtts:[["vision", 1], ["integration", 1], ["pulse", 1], ["intellect", 1], ["rhythm", 1]],
        efficiencyAtts:[["pulse", 1]],
        onCompleteText: {english:Raw.html`
                +<span style="font-weight:bold;" id="echoKindleResourceSent">???</span> Spark was added to Spark Mana.<br>
                `},
        extraInfo: {english:Raw.html`Exp & Mana gain = (Legacy)^.5 * Action Power * Speed * 10000.`},
        actionTriggers: [
            ["info", "text", "Generates Spark using Legacy"]
        ]
    },
    sparkMana: {
        tier:0, plane:1, resourceName:"spark", title: "Spark Decay", backwardsEfficiency: true,
        progressMaxBase:1000, progressMaxIncrease:4,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1,
        unlockCost:25, visible:false, unlocked:false, purchased: true, hasUpstream:false,
        onUnlock: function() {
            actionData.poolMana.generatorSpeed = 6;
        },
        onLevelCustom: function() {
            unlockAction(data.actions.poolMana);
            actionData.poolMana.generatorSpeed = 6;
            revealAction('poolMana');
            revealAction('expelMana');
        },
        onLevelAtts:[["spark", 5]],
        expAtts:[["amplification", 1]],
        efficiencyAtts:[["spark", -1]],
        actionTriggers: [
            ["info", "text", "Decays Spark from being used by Pool Mana. Increasing the attribute Spark reduces this effect, resulting in more mana."],
            ["unlock", "reveal", "poolMana"],
            ["unlock", "reveal", "expelMana"],
            ["unlock", "unlock", "poolMana"],
        ]
    },
    poolMana: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:60, progressMaxIncrease:1,
        expToLevelBase:2, expToLevelIncrease:3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.03,
        efficiencyBase:.08,
        unlockCost:0, visible:false, unlocked:false, purchased: true, hasDeltas: false, hasUpstream:false,
        isGenerator:true, generatorTarget:"poolMana", generatorSpeed:0,
        onCompleteCustom: function() {
            let sparkManaObj = data.actions.sparkMana;
            let actionObj = data.actions.poolMana;
            let dataObj = actionData.poolMana;
            dataObj.updateMults();

            addResourceTo(data.actions[dataObj.generatorTarget], actionObj.resourceToAdd);

            views.scheduleUpdate('poolManaResourceTaken', intToString(sparkManaObj.resource, 2), "textContent")
            views.scheduleUpdate('poolManaResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")

            sparkManaObj.resource = 0;
        },
        updateMults: function () {
            let actionObj = data.actions.poolMana;
            let dataObj = actionData.poolMana;

            actionObj.progressGain = dataObj.generatorSpeed * (actionObj.efficiency / 100);
            actionObj.actionPower = actionObj.actionPowerBase *
                actionObj.actionPowerMult * (actionObj.efficiency/100);
            actionObj.resourceToAdd = data.actions.sparkMana.resource * actionObj.actionPower * actionObj.upgradeMult;
            actionObj.expToAddBase = actionObj.resourceToAdd;
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
        },
        updateUpgradeMult:function() {
            let upgradeMult = 1;
            upgradeMult *= Math.pow(1.25, data.upgrades.sparkMoreMana.upgradePower);
            data.actions.poolMana.upgradeMult = upgradeMult;
        },
        onLevelAtts:[["pulse", 3]],
        expAtts:[["amplification", 1], ["wizardry", 1], ["control", 1], ["spellcraft", 1], ["intellect", 1]],
        efficiencyAtts:[["amplification", .01], ["pulse", .25]],
        onCompleteText: {english:Raw.html`
                -<span style="font-weight:bold;" id="poolManaResourceTaken">???</span> Spark was taken from Spark Mana, converted to<br>
                +<span style="font-weight:bold;" id="poolManaResourceSent">???</span> Mana, added to this action.<br>
                `},
        extraInfo: {english:Raw.html`Exp & Mana gain = Action Power * Speed.`},
        actionTriggers: [
            ["info", "text", "Takes 100% of Spark and converts it to Mana."],
            ["level_1", "reveal", "manaBasics"],
            ["level_1", "reveal", "prepareSpells"]
        ]
    },
    expelMana: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:.3, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.5, maxLevel:6,
        unlockCost:.3, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["amplification", 20], ["pulse", 1]],
        expAtts:[],
        efficiencyAtts:[["integration", .05]],
        actionTriggers: [
            ["level_1", "reveal", "magicResearch"],
            ["level_1", "reveal", "manaExperiments"],
            ["level_1", "reveal", "prepareInternalSpells"]
        ]
    },
    manaBasics: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:1, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.015, maxLevel:3,
        unlockCost:1, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["amplification", 60], ["pulse", 2]],
        expAtts:[],
        efficiencyAtts:[["integration", 3]],
        actionTriggers: [
            ["level_1", "reveal", "feelYourMana"],
            ["level_1", "reveal", "manaObservations"],
            ["level_1", "reveal", "infuseTheHide"]
        ]
    },
    manaExperiments: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:10, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.02, maxLevel:9,
        unlockCost:30, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["amplification", 200]],
        expAtts:[],
        efficiencyAtts:[["integration", 2]],
        actionTriggers: [
            ["level_1", "reveal", "growMagicSenses"],
            ["level_1", "reveal", "manaVisualizations"]
        ]
    },
    magicResearch: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:100, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:9,
        unlockCost:200, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["spark", 10], ["pulse", 5]],
        expAtts:[],
        efficiencyAtts:[],
        actionTriggers: [
            ["level_1", "reveal", "etchTheCircle"]
        ]
    },
    prepareSpells: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:100, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.35, maxLevel:9,
        unlockCost:500, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["spark", 3]],
        expAtts:[],
        efficiencyAtts:[["integration", .05]],
        actionTriggers: [
            ["level_1", "reveal", "overcharge"],
            // ["level_1", "reveal", "combatSpells"],
            // ["level_1", "reveal", "recoverSpells"]
        ]
    },
    prepareInternalSpells: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:300, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.3, maxLevel:9,
        unlockCost:500, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["spark", 3]],
        expAtts:[],
        efficiencyAtts:[["integration", .05]],
        actionTriggers: [
            ["level_1", "reveal", "overboost"]
        ]
    },
    overcharge: {
        tier:0, plane:1, resourceName:"mana", 
        progressMaxBase:100, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.4, maxLevel:1, isSpell:true, instabilityToAdd:5,
        unlockCost:500, visible:false, unlocked:false, purchased: true,
        spellpower: function() {
            return 10;
        },
        onLevelAtts:[["wizardry", 1]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .01]],
        extraInfo: {english:Raw.html`If a charge is available, Overclock has x10 action power. Uses a charge when Overclock completes.`},
        actionTriggers: [
            ["info", "text", "Uses charges to increase Momentum (check info)"],
            ["level_1", "reveal", "overponder"]
        ]
    },
    overboost: {
        tier:0, plane:1, resourceName:"mana", 
        progressMaxBase:1e6, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:1, isSpell:true, instabilityToAdd:10,
        unlockCost:1e6, visible:false, unlocked:false, purchased: true,
        spellpower: function() {
            return 10;
        },
        onLevelAtts:[["wizardry", 10]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]],
        extraInfo: {english:Raw.html`If a charge of this action and Overcharge is available, Overclock has x10 action power, stacking with Overcharge. Uses a charge when Overclock completes.`},
        actionTriggers: [
            ["info", "text", "Uses charges to increase Momentum (check info)"]
        ]
    },
    overponder: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:1e12, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:1, isSpell:true, instabilityToAdd:300,
        unlockCost:1e12, visible:false, unlocked:false, purchased: false,
        spellpower: function() {
            return 10;
        },
        onLevelAtts:[["wizardry", 20]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .0001]],
        extraInfo: {english:Raw.html`If a charge of this action, Overcharge, and Overboost is available, Overclock has x10 action power, stacking with Overboost and Overcharge. Uses a charge when Overclock completes.`},
        actionTriggers: [
            ["info", "text", "Uses charges to increase Momentum (check info)"]
        ]
    },
    manaObservations: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:30000, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:3,
        unlockCost:90000, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["vision", 150]],
        expAtts:[],
        efficiencyAtts:[["integration", 1]]
    },
    feelYourMana: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:100, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:9,
        unlockCost:300, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["amplification", 600]],
        expAtts:[],
        efficiencyAtts:[["integration", 2]],
        actionTriggers: [
            ["level_1", "reveal", "listenToTheMana"]
        ]
    },
    growMagicSenses: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.015, maxLevel:9,
        unlockCost:3000, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["amplification", 2000]],
        expAtts:[],
        efficiencyAtts:[["integration", 1]]
    },
    infuseTheHide: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:2000, progressMaxIncrease:1,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:2,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["vision", 5]],
        expAtts:[["amplification", .01]],
        efficiencyAtts:[],
        actionTriggers: [
            ["level_1", "reveal", "bindThePages"]
        ]
    },
    etchTheCircle: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:2000, progressMaxIncrease:1,
        expToLevelBase:9, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:1,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["vision", 30]],
        expAtts:[["amplification", .01]],
        efficiencyAtts:[],
        actionTriggers: [
            ["level_1", "reveal", "awakenYourGrimoire"]
        ]
    },
    bindThePages: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:300, progressMaxIncrease:1.01,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:100,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["vision", 1]],
        expAtts:[["amplification", .01]],
        efficiencyAtts:[]
    },
    awakenYourGrimoire: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:30000, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:1,
        unlockCost:6000, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["integration", 200]],
        expAtts:[["amplification", .01]],
        efficiencyAtts:[],
        actionTriggers: [
            ["level_1", "reveal", "prepareExternalSpells"],
            ["level_1", "reveal", "supportSpells"],
            ["level", "addMaxLevels", "overcharge", 1],
            ["level", "addMaxLevels", "overboost", 1],
            ["level", "addMaxLevels", "overponder", 1],
            ["level", "addMaxLevels", "earthMagic", 1]
        ]
    },
    prepareExternalSpells: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:100000, progressMaxIncrease:33,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.15, maxLevel:6,
        unlockCost:20000, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["vision", 100]],
        expAtts:[["spellcraft", 10], ["intellect", 1]],
        efficiencyAtts:[["integration", .05]],
        actionTriggers: [
            ["level_1", "reveal", "earthMagic"],
            ["level_1", "reveal", "practicalMagic"]
        ]
    },
    supportSpells: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:300000, progressMaxIncrease:33,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:9,
        unlockCost:30000, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["vision", 100]],
        expAtts:[["spellcraft", 1], ["intellect", 1]],
        efficiencyAtts:[["integration", .05]],
        actionTriggers: [
            ["level_1", "reveal", "moveEarth"],
            ["level_1", "reveal", "illuminate"]
        ]
    },
    earthMagic: {
        tier:0, plane:1, resourceName:"mana", title:"Dirt Magic",
        progressMaxBase:10000, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:0, isSpell:true, instabilityToAdd:100, power:1,
        unlockCost:20000, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["wizardry", 200]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]],
        actionTriggers: [
            ["level_1", "reveal", "hardenEarth"]
        ]
    },
    moveEarth: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2,  title:"Move Dirt",
        progressMaxBase:3e9, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:1, isSpell:true, instabilityToAdd:125, power:3,
        unlockCost:1e12, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["wizardry", 300]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]],
        actionTriggers: [
            ["level_1", "reveal", "shapeEarth"],
            ["level_1", "reveal", "digFoundation"]
        ]
    },
    hardenEarth: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2,  title: "Harden Dirt",
        progressMaxBase:3e11, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.003, maxLevel:1, isSpell:true, instabilityToAdd:150, power:6,
        unlockCost:1e13, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["wizardry", 600]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]],
        actionTriggers: [
            ["level_1", "reveal", "moveIron"],
            ["level_1", "reveal", "stoneCompression"]
        ]
    },
    shapeEarth: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2,  title: "Shape Dirt",
        progressMaxBase:9e12, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:1, isSpell:true, instabilityToAdd:175, power:10,
        unlockCost:1e14, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["wizardry", 1000]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]],
        actionTriggers: [
            ["level_1", "reveal", "reinforceArmor"],
            ["level_1", "reveal", "shapeBricks"]
        ]
    },
    practicalMagic: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:3e14, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:1, isSpell:true, instabilityToAdd:200, power:30,
        unlockCost:3e14, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["wizardry", 1500]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]],
        actionTriggers: [
            ["level_1", "reveal", "illuminate"],
            ["level_1", "reveal", "tidyMagesmithShop"]
        ]
    },
    illuminate: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:3e15, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.0005, maxLevel:1, isSpell:true, instabilityToAdd:225, power:50,
        unlockCost:3e15, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["wizardry", 2500]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]],
        actionTriggers: [
            ["level_1", "reveal", "unblemish"],
            ["level_1", "reveal", "clearTheBasement"]
        ]
    },
    moveIron: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:1e16, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.0003, maxLevel:1, isSpell:true, instabilityToAdd:100, power:100,
        unlockCost:1e16, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["wizardry", 4000]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]],
        actionTriggers: [
            ["level_1", "reveal", "restoreEquipment"],
            ["level_1", "reveal", "moldBarsFromScrap"]
        ]
    },
    reinforceArmor: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:3e16, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.0002, maxLevel:1, isSpell:true, instabilityToAdd:100, power:150,
        unlockCost:3e16, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["wizardry", 6000]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]],
        actionTriggers: [
            ["level_1", "reveal", "mendGearCracks"]
        ]
    },
    restoreEquipment: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:1e17, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:1, isSpell:true, instabilityToAdd:100, power:250,
        unlockCost:1e17, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["wizardry", 10000]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]],
        actionTriggers: [
            ["level_1", "reveal", "assistantMagesmith"]
        ]
    },
    unblemish: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:3e17, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.00008, maxLevel:1, isSpell:true, instabilityToAdd:100, power:400,
        unlockCost:3e17, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["wizardry", 12000]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]],
        actionTriggers: [
            ["level_1", "reveal", "manaTransfer"]
        ]
    },
    manaTransfer: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:1e18, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.00005, maxLevel:1, isSpell:true, instabilityToAdd:100, power:600,
        unlockCost:1e18, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["wizardry", 15000]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]]
    },
    manaVisualizations: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:5e12, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.02, maxLevel:3,
        unlockCost:5e13, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["vision", 2000]],
        expAtts:[["cycle", .01]],
        efficiencyAtts:[["integration", .05]]
    },
    manaShaping: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    listenToTheMana: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:5e11, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.02, maxLevel:3,
        unlockCost:5e12, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["amplification", 2e5]],
        expAtts:[["cycle", .01]],
        efficiencyAtts:[["integration", .05]]
    },
    manaInstinct: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[["integration", .05]]
    },
    auraControl: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:5e12, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.02, maxLevel:6,
        unlockCost:5e13, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["control", 100]],
        expAtts:[["cycle", .01]],
        efficiencyAtts:[["integration", .05]]
    },
    divination: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    identifyItem: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    detectMagic: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    recoverSpells: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:20e7, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:9,
        unlockCost:20e7, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["vision", 1000]],
        expAtts:[],
        efficiencyAtts:[["integration", .05]]
    },
    healingMagic: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

    singleTargetHealing: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    purifyPoison: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    massHeal: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    auraHealing: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    healBurst: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    combatSpells: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:20e10, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:9,
        unlockCost:20e10, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["vision", 10000]],
        expAtts:[],
        efficiencyAtts:[["integration", .05]]
    },
    swarmSpells: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    fireball: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    wardMagic: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    ward: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    duellingSpells: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    firebolt: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },


}
