
//==== plane2 ====
actionData = {
    ...actionData,

    echoKindle: {
        tier:0, plane:1, resourceName:"legacy",
        progressMaxBase:10, progressMaxIncrease:1,
        expToLevelBase:10000000, expToLevelIncrease:1.2,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.05,
        efficiencyBase:.008,
        unlockCost:0, visible:false, unlocked:false, purchased: true, hasDeltas: false,
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
        extraInfo: {english:Raw.html`Exp & Mana gain = (Legacy)^.5 * Action Power * Efficiency * 10000.`},
        iconText: {english:Raw.html`
        Generates Spark using Legacy
`}
    },
    sparkMana: {
        tier:0, plane:1, resourceName:"spark", title: "Spark Decay", backwardsEfficiency: true,
        progressMaxBase:1000, progressMaxIncrease:4,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1,
        unlockCost:25, visible:false, unlocked:false, purchased: true, hasUpstream:false,
        onUnlock: function() {
            unlockAction(data.actions.poolMana);
            unveilAction('poolMana');
            actionData.poolMana.generatorSpeed = 6;
            unveilAction('expelMana')
        },
        onLevelCustom: function() {
            unlockAction(data.actions.poolMana);
            actionData.poolMana.generatorSpeed = 6;
            unveilAction('poolMana');
            unveilAction('expelMana');
        },
        onLevelAtts:[["spark", 5]],
        expAtts:[["amplification", 1]],
        efficiencyAtts:[["spark", -1]],
        iconText: {english:Raw.html`
        Decays Spark from being used by Pool Mana. Increasing the attribute Spark reduces this effect, resulting in more mana.<br>
        On Unlock: Reveal Pool Mana<br>
        On Unlock: Reveal Expel Mana
`}
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
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('manaBasics')
            unveilAction('prepareSpells')
        },
        onLevelAtts:[["pulse", 3]],
        expAtts:[["amplification", 1], ["wizardry", 1], ["control", 1], ["spellcraft", 1], ["intellect", 1]],
        efficiencyAtts:[["amplification", .01], ["pulse", .25]],
        onCompleteText: {english:Raw.html`
                -<span style="font-weight:bold;" id="poolManaResourceTaken">???</span> Spark was taken from Spark Mana, converted to<br>
                +<span style="font-weight:bold;" id="poolManaResourceSent">???</span> Mana, added to this action.<br>
                `},
        extraInfo: {english:Raw.html`Exp & Mana gain = Action Power * Efficiency.`},
        iconText: {english:Raw.html`
        Takes 100% of Spark and converts it to Mana.<br>
        Level 1: Reveal Mana Basics<br>
        Level 1: Reveal Prepare Spells
`}
    },
    expelMana: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:.3, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.5, maxLevel:6,
        unlockCost:.3, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function () {
            unveilAction('magicResearch')
            unveilAction('manaExperiments')
            unveilAction('prepareInternalSpells')
        },
        onLevelAtts:[["amplification", 20], ["pulse", 1]],
        expAtts:[],
        efficiencyAtts:[["integration", .05]],
        iconText: {english:Raw.html`
        Level 1: Reveal Magic Research<br>
        Level 1: Reveal Mana Experiments<br>
        Level 1: Reveal Prepare Internal Spells
`}
    },
    manaBasics: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:1, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.015, maxLevel:3,
        unlockCost:1, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function () {
            unveilAction('feelYourMana')
            unveilAction('manaObservations')
            unveilAction('infuseTheHide')
        },
        onLevelAtts:[["amplification", 60], ["pulse", 2]],
        expAtts:[],
        efficiencyAtts:[["integration", 3]],
        iconText: {english:Raw.html`
        Level 1: Reveal Feel Your Mana<br>
        Level 1: Reveal Mana Observations<br>
        Level 1: Reveal Infuse The Hide
`}
    },
    manaExperiments: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:10, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.02, maxLevel:9,
        unlockCost:30, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            unveilAction('growMagicSenses')
            unveilAction('manaVisualizations')
        },
        onLevelAtts:[["amplification", 200]],
        expAtts:[],
        efficiencyAtts:[["integration", 2]],
        iconText: {english:Raw.html`
        Level 1: Reveal Grow Magic Senses<br>
        Level 1: Reveal Mana Visualizations
`}
    },
    magicResearch: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:100, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:9,
        unlockCost:200, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            unveilAction('etchTheCircle')
        },
        onLevelAtts:[["spark", 10], ["pulse", 5]],
        expAtts:[],
        efficiencyAtts:[],
        iconText: {english:Raw.html`
        Level 1: Reveal Etch The Circle
`}
    },
    prepareSpells: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:100, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.35, maxLevel:9,
        unlockCost:500, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            unveilAction('overcharge')
            unveilAction('combatSpells')
            unveilAction('recoverSpells')
        },
        onLevelAtts:[["spark", 3]],
        expAtts:[],
        efficiencyAtts:[["integration", .05]],
        iconText: {english:Raw.html`
        Level 1: Reveal Overcharge<br>
        Level 1: Reveal Combat Spells<br>
        Level 1: Reveal Recover Spells
`}
    },
    prepareInternalSpells: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:300, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.3, maxLevel:9,
        unlockCost:500, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            unveilAction('overboost')
        },
        onLevelAtts:[["spark", 3]],
        expAtts:[],
        efficiencyAtts:[["integration", .05]],
        iconText: {english:Raw.html`
        Level 1: Reveal Overboost
`}
    },
    overcharge: {
        tier:0, plane:1, resourceName:"mana", 
        progressMaxBase:100, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.4, maxLevel:1, isSpell:true, instabilityToAdd:5,
        unlockCost:500, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            unveilAction('overponder')
        },
        spellpower: function() {
            return 10;
        },
        onLevelAtts:[["wizardry", 1]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .01]],
        extraInfo: {english:Raw.html`If a charge is available, Overclock has x10 action power. Uses a charge when Overclock completes.`},
        iconText: {english:Raw.html`
        Uses charges to increase Momentum<br>
        Level 1: Reveal Overponder
`}
    },
    overboost: {
        tier:0, plane:1, resourceName:"mana", 
        progressMaxBase:1e6, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:1, isSpell:true, instabilityToAdd:10,
        unlockCost:1e6, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
        },
        spellpower: function() {
            return 10;
        },
        onLevelAtts:[["wizardry", 10]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]],
        extraInfo: {english:Raw.html`If a charge of this action and Overcharge is available, Overclock has x10 action power, stacking with Overcharge. Uses a charge when Overclock completes.`},
        iconText: {english:Raw.html`
        Uses charges to increase Momentum
`}
    },
    overponder: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:1e12, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:1, isSpell:true, instabilityToAdd:300,
        unlockCost:1e12, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
        },
        spellpower: function() {
            return 10;
        },
        onLevelAtts:[["wizardry", 20]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .0001]],
        extraInfo: {english:Raw.html`If a charge of this action, Overcharge, and Overboost is available, Overclock has x10 action power, stacking with Overboost and Overcharge. Uses a charge when Overclock completes.`},
        iconText: {english:Raw.html`
        Uses charges to increase Momentum
`}
    },
    manaObservations: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:30000, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:3,
        unlockCost:90000, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
        },
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
        onLevelCustom: function() {
            unveilAction('listenToTheMana');
        },
        onLevelAtts:[["amplification", 600]],
        expAtts:[],
        efficiencyAtts:[["integration", 2]],
        iconText: {english:Raw.html`
        Level 1: Reveal Listen To The Mana
`}
    },
    growMagicSenses: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.015, maxLevel:9,
        unlockCost:3000, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
        },
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
        onLevelCustom: function() {
            unveilAction('bindThePages')
        },
        onLevelAtts:[["vision", 5]],
        expAtts:[["amplification", .01]],
        efficiencyAtts:[],
        iconText: {english:Raw.html`
        Level 1: Reveal Bind The Pages
`}
    },
    etchTheCircle: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:2000, progressMaxIncrease:1,
        expToLevelBase:9, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:1,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            unveilAction('awakenYourGrimoire')
        },
        onLevelAtts:[["vision", 30]],
        expAtts:[["amplification", .01]],
        efficiencyAtts:[],
        iconText: {english:Raw.html`
        Level 1: Reveal Awaken Your Grimoire
`}
    },
    bindThePages: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:300, progressMaxIncrease:1.01,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:100,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
        },
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
        onLevelCustom: function() {
            unveilAction('prepareExternalSpells')
            unveilAction('supportSpells')
            addMaxLevel("overcharge", 1);
            addMaxLevel("overboost", 1);
            addMaxLevel("overponder", 1);
            addMaxLevel("earthMagic", 1);
        },
        onLevelAtts:[["integration", 200]],
        expAtts:[["amplification", .01]],
        efficiencyAtts:[],
        iconText: {english:Raw.html`
        Level 1: Reveal Prepare External Spells<br>
        Level 1: Reveal Support Spells<br>
        Level 1: +1 max level to Overcharge, Overboost, OverPonder, and Dirt Magic
`}
    },
    prepareExternalSpells: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:100000, progressMaxIncrease:33,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.15, maxLevel:6,
        unlockCost:20000, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            unveilAction('earthMagic')
            unveilAction('practicalMagic')
        },
        onLevelAtts:[["vision", 100]],
        expAtts:[["spellcraft", 10], ["intellect", 1]],
        efficiencyAtts:[["integration", .05]],
        iconText: {english:Raw.html`
        Level 1: Reveal Dirt Magic<br>
        Level 1: Reveal Practical Magic
`}
    },
    supportSpells: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:300000, progressMaxIncrease:33,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:9,
        unlockCost:30000, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            unveilAction('moveEarth')
            unveilAction('illuminate')
        },
        onLevelAtts:[["vision", 100]],
        expAtts:[["spellcraft", 1], ["intellect", 1]],
        efficiencyAtts:[["integration", .05]],
        iconText: {english:Raw.html`
        Level 1: Reveal Move Dirt<br>
        Level 1: Reveal Illuminate
`}
    },
    earthMagic: {
        tier:0, plane:1, resourceName:"mana", title:"Dirt Magic",
        progressMaxBase:10000, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:0, isSpell:true, instabilityToAdd:100, power:1,
        unlockCost:20000, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            unveilAction('hardenEarth')
        },
        onLevelAtts:[["wizardry", 200]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]],
        iconText: {english:Raw.html`
        Level 1: Reveal Harden Dirt
`}
    },
    moveEarth: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2,  title:"Move Dirt",
        progressMaxBase:3e9, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:1, isSpell:true, instabilityToAdd:125, power:3,
        unlockCost:1e12, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            if(data.upgrades.askAboutBetterWork.upgradePower > 0) {
                unveilAction('shapeEarth')
                unveilAction('digFoundation')
            }
        },
        onLevelAtts:[["wizardry", 300]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]],
        iconText: {english:Raw.html`
        Level 1: Reveal Shape Dirt<br>
        Level 1: Reveal Dig Foundation
`}
    },
    hardenEarth: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2,  title: "Harden Dirt",
        progressMaxBase:3e11, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.003, maxLevel:1, isSpell:true, instabilityToAdd:150, power:6,
        unlockCost:1e13, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            if(data.upgrades.askAboutBetterWork.upgradePower > 0) {
                unveilAction('moveIron')
                unveilAction('stoneCompression')
            }
        },
        onLevelAtts:[["wizardry", 600]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]],
        iconText: {english:Raw.html`
        Level 1: Reveal Move Iron<br>
        Level 1: Reveal Stone Compression
`}
    },
    shapeEarth: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2,  title: "Shape Dirt",
        progressMaxBase:9e12, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:1, isSpell:true, instabilityToAdd:175, power:10,
        unlockCost:1e14, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            if(data.upgrades.askAboutBetterWork.upgradePower > 0) {
                unveilAction('reinforceArmor')
                unveilAction('shapeBricks')
            }
        },
        onLevelAtts:[["wizardry", 1000]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]],
        iconText: {english:Raw.html`
        Level 1: Reveal Reinforce Armor<br>
        Level 1: Reveal Shape Bricks
`}
    },
    practicalMagic: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:3e14, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:1, isSpell:true, instabilityToAdd:200, power:30,
        unlockCost:3e14, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            if(data.upgrades.askAboutBetterWork.upgradePower > 0) {
                unveilAction('illuminate')
                unveilAction('tidyMagesmithShop')
            }
        },
        onUnlock: function() {
        },
        onLevelAtts:[["wizardry", 1500]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]],
        iconText: {english:Raw.html`
        Level 1: Reveal Illuminate<br>
        Level 1: Reveal Tidy Magesmith Shop
`}
    },
    illuminate: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:3e15, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.0005, maxLevel:1, isSpell:true, instabilityToAdd:225, power:50,
        unlockCost:3e15, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            if(data.upgrades.askAboutBetterWork.upgradePower > 0) {
                unveilAction('unblemish')
                unveilAction('clearTheBasement')
            }
        },
        onLevelAtts:[["wizardry", 2500]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]],
        iconText: {english:Raw.html`
        Level 1: Reveal Unblemish<br>
        Level 1: Reveal Clear The Basement
`}
    },
    moveIron: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:1e16, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.0003, maxLevel:1, isSpell:true, instabilityToAdd:100, power:100,
        unlockCost:1e16, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('restoreEquipment')
            unveilAction('moldBarsFromScrap')
        },
        onLevelAtts:[["wizardry", 4000]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]],
        iconText: {english:Raw.html`
        Level 1: Reveal Restore Equipment<br>
        Level 1: Reveal Mold Bars From Scrap
`}
    },
    reinforceArmor: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:3e16, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.0002, maxLevel:1, isSpell:true, instabilityToAdd:100, power:150,
        unlockCost:3e16, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('mendGearCracks')
        },
        onLevelAtts:[["wizardry", 6000]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]],
        iconText: {english:Raw.html`
        Level 1: Reveal Mend Gear Cracks
`}
    },
    restoreEquipment: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:1e17, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:1, isSpell:true, instabilityToAdd:100, power:250,
        unlockCost:1e17, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('assistantMagesmith')
        },
        onLevelAtts:[["wizardry", 10000]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]],
        iconText: {english:Raw.html`
        Level 1: Reveal Assistant Magesmith
`}
    },
    unblemish: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:3e17, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.00008, maxLevel:1, isSpell:true, instabilityToAdd:100, power:400,
        unlockCost:3e17, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('manaTransfer')
        },
        onUnlock: function() {
        },
        onLevelAtts:[["wizardry", 12000]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]],
        iconText: {english:Raw.html`
        Level 1: Reveal Mana Transfer
`}
    },
    manaTransfer: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, 
        progressMaxBase:1e18, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.00005, maxLevel:1, isSpell:true, instabilityToAdd:100, power:600,
        unlockCost:1e18, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
        },
        onUnlock: function() {
        },
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
        onLevelCustom: function() {
        },
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
        onLevelCustom: function() {
        },
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
        onLevelCustom: function() {
        },
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
        onLevelCustom: function() {
        },
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
        onUnlock: function() {
        },
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
        onUnlock: function() {
        },
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
        onUnlock: function() {
        },
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
        onUnlock: function() {
        },
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
        onUnlock: function() {
        },
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
        onUnlock: function() {
        },
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
        onUnlock: function() {
        },
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
        onUnlock: function() {
        },
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
        onUnlock: function() {
        },
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
        onUnlock: function() {
        },
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
        onUnlock: function() {
        },
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
        onUnlock: function() {
        },
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
        onUnlock: function() {
        },
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
        onUnlock: function() {
        },
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
        onUnlock: function() {
        },
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
        onUnlock: function() {
        },
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
        onUnlock: function() {
        },
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
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },


}
