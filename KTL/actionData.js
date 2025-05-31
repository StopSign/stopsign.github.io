function create(actionVar, downstreamVars, x, y) {
    let dataObj = actionData[actionVar];
    if(!dataObj) {
        console.log("Could not find in actionData, " + actionVar);
        return;
    }
    x*= 420;
    y*= -420;
    if(!dataObj.addedInVersion) {
        dataObj.addedInVersion = 0;
    }
    let title = decamelizeWithSpace(actionVar); //basicLabor -> Basic Labor
    let actionObj = createAndLinkNewAction(actionVar, dataObj, title, x, y, downstreamVars);
    dataObj.expAtts.forEach(function (expAtt) { //add the action to the stat, to update exp reductions
        for(let attVar in data.atts) {
            let att = data.atts[attVar];
            if(expAtt[0] === att.attVar) {
                att.linkedActionExpAtts.push(actionVar);
            }
        }
    });
    dataObj.efficiencyAtts.forEach(function (expertiseAtt) { //add the action to the stat, to update exp reductions
        for(let attVar in data.atts) {
            let att = data.atts[attVar];
            if(expertiseAtt[0] === att.attVar) {
                att.linkedActionEfficiencyAtts.push(actionVar);
            }
        }
    });
    dataObj.onLevelAtts.forEach(function (onLevelAtt) { //add the action to the stat, to update exp reductions
        for(let attVar in data.atts) {
            let att = data.atts[attVar];
            if(onLevelAtt[0] === att.attVar) {
                att.linkedActionOnLevelAtts.push(actionVar);
            }
        }
    });
}

//==== plane0 ====

//Book 1 actions
let actionData = {
    overclock:{
        tier:0, plane:0,
        progressMaxBase:10, progressMaxIncrease:1,
        expToLevelBase:10, expToLevelIncrease:1.1,
        actionPowerBase:100, actionPowerMult:1, actionPowerMultIncrease:1.1,
        efficiencyBase:.1,
        unlockCost:0, visible:true, unlocked:true, purchased: true, isGenerator:true, generatorSpeed:10, hasUpstream:false,
        onUnlock: function() {
        },
        onCompleteCustom:function() {
            actionData.overclock.updateMults();
            data.actions.overclock.resource += data.actions.overclock.resourceAdded;

            if(data.actions.hearAboutTheLich.unlocked) {
                data.actions.hearAboutTheLich.actionPower = calcFearGain();
                data.actions.hearAboutTheLich.resource += data.actions.hearAboutTheLich.actionPower;
            }
        },
        updateMults: function() {
            data.actions.overclock.resourceAdded = data.actions.overclock.actionPower * data.actions.overclock.upgradeMult;
        },
        onLevelCustom: function() {
            actionData.overclock.updateMults();
        },
        updateUpgradeMult:function() {
            let upgradeMult = 1;
            upgradeMult *= Math.pow(2, data.upgrades.createABetterFoundation.upgradePower);
            data.actions.overclock.upgradeMult = upgradeMult;
        },
        onLevelAtts:[],
        expAtts:[["awareness", 1], ["concentration", 1], ["energy", 1], ["ambition", 1], ["control", 1],
            ["flow", 1], ["willpower", 1], ["coordination", 1], ["integration", 1], ["rhythm", 1],
            ["pulse", 1]],
        efficiencyAtts:[["cycle", 1]]
    },
    reflect: {
        tier:1, plane:0,
        progressMaxBase:.25, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.5,
        unlockCost:1, visible:true, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('harnessOverflow')
        },
        onLevelAtts:[["awareness", 5]],
        expAtts:[["concentration", 5], ["cycle", 5], ["observation", 5], ["energy", 5]],
        efficiencyAtts:[["cycle", 1]]
    },
    harnessOverflow: {
        tier:1, plane:0,
        progressMaxBase:.25, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:2, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            unveilAction('distillInsight')
        },
        onLevelAtts:[["cycle", 1]],
        expAtts:[["awareness", 1], ["energy", 1]],
        efficiencyAtts:[]
    },
    distillInsight: {
        tier:1, plane:0,
        progressMaxBase:1, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.4,
        unlockCost:30, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            unveilAction('takeNotes')
        },
        onLevelAtts:[["concentration", 1]],
        expAtts:[],
        efficiencyAtts:[["cycle", 1]]
    },
    takeNotes: {
        tier:1, plane:0,
        progressMaxBase:1, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.3,
        unlockCost:100, visible:false, unlocked:false, purchased: true,
        onLevelCustom:function() {
            unveilAction('bodyAwareness')
        },
        onLevelAtts:[["awareness", 10], ["curiosity", 3]],
        expAtts:[["observation", 1]],
        efficiencyAtts:[["cycle", 1]]
    },
    bodyAwareness: {
        tier:1, plane:0,
        progressMaxBase:750, progressMaxIncrease:20,
        expToLevelBase:2, expToLevelIncrease:1,
        efficiencyBase:.6, maxLevel:1,
        unlockCost:50, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('travelOnRoad')
        },
        onLevelAtts:[["awareness", 100]],
        expAtts:[["curiosity", 1], ["concentration", 1], ["energy", 1], ["endurance", 1]],
        efficiencyAtts:[["flow", .1]]
    },
    remember: {
        tier:1, plane:0,
        progressMaxBase:2000, progressMaxIncrease:5,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:3,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            data.actions.bodyAwareness.maxLevel++;
        },
        onLevelCustom: function() {
            data.actions.harnessOverflow.maxLevel+=3;
        },
        onLevelAtts:[["concentration", 5]],
        expAtts:[["awareness", 1], ["observation", 1]], //~x30 awareness when unlocked
        efficiencyAtts:[["cycle", 1]],
        unlockMessage:{english:"On unlock, +1 max level for Body Awareness."},
        extraInfo:{english:"On Level up: +3 max levels for Harness Overflow."}
    },
    travelOnRoad: {
        tier:1, plane:0,
        progressMaxBase:50, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.5, maxLevel:15,
        unlockCost:200, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('travelToOutpost')
            unveilAction('meetVillageLeaderScott')
        },
        onLevelCustom: function() {
            unveilAction('remember');
        },
        onLevelAtts:[["energy", 1], ["curiosity", 2]],
        expAtts:[["concentration", 1], ["endurance", 1]],
        efficiencyAtts:[["navigation", 1]]
    },
    travelToOutpost: {
        tier:1, plane:0,
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.25, maxLevel:45,
        unlockCost:20000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            data.actions.bodyAwareness.maxLevel+=1;
        },
        onLevelAtts:[["energy", 2], ["curiosity", 5]],
        expAtts:[["endurance", 1]],
        efficiencyAtts:[["navigation", 1]],
        unlockMessage:{english:"On unlock, +1 max level for Body Awareness."}
    },
    meetVillageLeaderScott: {
        tier:1, plane:0,
        progressMaxBase:5000, progressMaxIncrease:40,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.5, maxLevel:3,
        unlockCost:20000, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            data.actions.remember.maxLevel+=2
            unveilAction('helpScottWithChores')
            unveilAction('watchBirds')
        },
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[["curiosity", 1], ["observation", 1]],
        efficiencyAtts:[["observation", 10]],
        extraInfo:{english:"On Level up: +2 max levels for Remember."}
    },
    helpScottWithChores: {
        tier:1, plane:0,
        progressMaxBase:25000, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.2,
        wage: 1,
        unlockCost:10000, visible:false, unlocked:false, purchased: true,
        onUnlock:function() {
            unveilAction('makeMoney')
        },
        onLevelCustom: function() {
            data.actions.helpScottWithChores.wage += actionData.helpScottWithChores.wage/4;
            unveilAction('hearAboutTheLich');
        },
        onLevelAtts:[["recognition", 1]],
        expAtts:[["ambition", 1]],
        efficiencyAtts:[["energy", 1]],
        extraInfo:{english:"On Level up: Increase wage +25%"}
    },
    browseLocalMarket: {
        tier:1, plane:0,
        progressMaxBase:10000, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1,
        unlockCost:100000, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
        },
        onLevelAtts:[["savvy", 3], ["recognition", 1]],
        expAtts:[["observation", 1], ["recognition", 1], ["confidence", 1], ["discernment", 1]],
        efficiencyAtts:[["ambition", 10]]
    },
    checkNoticeBoard: {
        tier:1, plane:0,
        progressMaxBase:5e6, progressMaxIncrease:20,
        expToLevelBase:2, expToLevelIncrease:2,
        efficiencyBase:.03125, maxLevel:1, //1/32
        unlockCost:200000, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            if(data.actions.checkNoticeBoard.level >= 1) {
                unveilAction('socialize');
            }
            if(data.actions.checkNoticeBoard.level >= 2) {
                unveilAction('reportForTraining')
            }
            if(data.actions.checkNoticeBoard.level >= 3) {
                unveilAction('reportForLabor')
                unveilAction('oddJobsLaborer')
            }
        },
        onLevelAtts:[],
        expAtts:[["observation", 1]],
        efficiencyAtts:[["observation", 1], ["savvy", 1]],
        extraInfo:{english:"Unlocks new actions with each level."}
    },
    makeMoney: {
        tier:1, plane:0,
        progressMaxBase:10, progressMaxIncrease:1,
        expToLevelBase:100, expToLevelIncrease:1.4,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.1,
        efficiencyBase:.1,
        unlockCost:4e5, visible:false, unlocked:false, purchased: true,
        isGenerator:true, generatorTarget:"spendMoney", generatorSpeed:5,
        onCompleteCustom: function() {
            //Take 1% (tier) of current, consume all of it
            //give 1 part to equation, 1 part to consume for expertise
            //equation takes its part and log(part)^2, gives that to spendMoney

            let actionObj = data.actions.makeMoney;
            let actionTarget = data.actions[actionObj.generatorTarget];
            let dataObj = actionData.makeMoney;

            //this is the amount to remove from actionObj (1%)
            let amount = actionObj.resource * actionObj.tierMult();
            //this is log10(1% * actionPower)^2 * efficiency
            let amountToSend = dataObj.actionPowerFunction(amount, actionObj.actionPower * actionObj.upgradeMult) * (actionObj.efficiency/100);
            //visual only
            actionObj.amountToSend = amountToSend;
            if(amountToSend > 0) { //only take if it gave
                actionObj.resource -= amount;
            }

            addMomentumTo(actionTarget, amountToSend);

            //add exp based on amount sent
            actionObj.expToAddBase = amountToSend;
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult * calcUpgradeMultToExp(actionObj);
            data.actions.makeMoney.resourceAdded = amountToSend;
            view.cached['makeMoneyMomentumTaken'].textContent = intToString(amount, 2);
        },
        onUnlock: function() {
            unveilAction('spendMoney');
            data.displayJob = true;
            document.getElementById("jobDisplay").style.display = "";
        },
        updateUpgradeMult:function() {
            let upgradeMult = 1;
            upgradeMult *= Math.pow(2, data.upgrades.makeMoreMoney.upgradePower);
            data.actions.makeMoney.upgradeMult = upgradeMult;
        },
        onLevelAtts:[["ambition", 1]],
        expAtts:[["cunning", 1]],
        efficiencyAtts:[["ambition", 1]],
        actionPowerFunction: function(resource, origMult) {
            if(resource * origMult < 1) {
                return 0;
            }
            return Math.pow(Math.log10(resource * origMult), 3) * data.currentWage; //log10(num * mult)^2 * wage
        },
        onCompleteText: {english:Raw.html`
                +<span style="font-weight:bold;" id='makeMoneyAmountToSend'>1</span> gold in Spend Money.<br>
                -<span style="font-weight:bold;" id='makeMoneyMomentumTaken'>1</span> Momentum taken from this action.<br>`},
        extraInfo: {english:Raw.html`<br>Exp & Gold gain = log10(Momentum/100 * Action Power)^3 * Efficiency * Wages.`}
    },
    spendMoney: {
        tier:1, plane:0, resourceName:"gold",
        progressMaxBase:1, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1,
        unlockCost:1, visible:false, unlocked:false, purchased: true, hasUpstream:false,
        onUnlock:function() {
            unveilAction('browseLocalMarket');
            unveilAction('checkNoticeBoard');
        },
        onLevelAtts:[["energy", 10]],
        expAtts:[["savvy", 1]],
        efficiencyAtts:[]
    },
    buySocialAccess: {
        tier:1, plane:0, resourceName:"gold",
        progressMaxBase:1, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.8,
        unlockCost:1, visible:false, unlocked:false, purchased: true,
        onUnlock:function() {
        },
        onLevelAtts:[["recognition", 1], ["charm", 1]],
        expAtts:[["savvy", 1]],
        efficiencyAtts:[]
    },
    slideTheCoin: {
        tier:1, plane:0, resourceName:"gold",
        progressMaxBase:50, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:1,
        unlockCost:200, visible:false, unlocked:false, purchased: true,
        onUnlock:function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["influence", 10]],
        expAtts:[["recognition", 1]],
        efficiencyAtts:[["recognition", 1]]
    },
    buyCoffee: {
        tier:1, plane:0, resourceName:"gold",
        progressMaxBase:10, progressMaxIncrease:1.2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.8,
        unlockCost:1, visible:false, unlocked:false, purchased: true,
        onUnlock:function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["cunning", 1]],
        expAtts:[["savvy", 1]],
        efficiencyAtts:[["discernment", 1]]
    },
    reportForLabor: {
        tier:1, plane:0,
        progressMaxBase:20, progressMaxIncrease:4,
        expToLevelBase:4, expToLevelIncrease:1.1,
        efficiencyBase:.5,
        unlockCost:5000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('fillBasicNeeds');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    oddJobsLaborer: {
        tier:1, plane:0,
        progressMaxBase:1e3, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1.2,
        efficiencyBase:.2, maxLevel:8,
        wage: 10,
        unlockCost:1e3, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            data.actions.oddJobsLaborer.wage += actionData.oddJobsLaborer.wage/4;
            changeJob('oddJobsLaborer');
            if(data.actions.oddJobsLaborer.level >= 2) {
                unveilAction('chimneySweep');
            }
        },
        onUnlock:function() {
            changeJob('oddJobsLaborer');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        unlockMessage:{english:"On unlock, set job to Odd Jobs Laborer for a base wage of $10."}
    },
    socialize: {
        tier:1, plane:0,
        progressMaxBase:10, progressMaxIncrease:1,
        expToLevelBase:3000, expToLevelIncrease:1.2,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.2,
        efficiencyBase:.05,
        unlockCost:20e6, visible:false, unlocked:false, purchased: true,
        isGenerator:true, generatorTarget:"meetPeople", generatorSpeed:20,
        onCompleteCustom: function() {
            let actionObj = data.actions.socialize;
            let actionTarget = data.actions[actionObj.generatorTarget];
            let dataObj = actionData.makeMoney;

            //this is the amount to remove from actionObj (1%)
            let amount = actionObj.resource * actionObj.tierMult();
            //this is log10(1% * actionPower)^2 * efficiency
            let amountToSend = dataObj.actionPowerFunction(amount, actionObj.actionPower * actionObj.upgradeMult) * (actionObj.efficiency/100);
            //visual only
            actionObj.amountToSend = amountToSend;
            if(amountToSend > 0) { //only take if it gave
                actionObj.resource -= amount;
            }

            addMomentumTo(actionTarget, amountToSend);

            //add exp based on amount sent
            actionObj.expToAddBase = amountToSend;
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult * calcUpgradeMultToExp(actionObj);
            data.actions.socialize.resourceAdded = amountToSend;
            view.cached['socializeMomentumTaken'].textContent = intToString(amount, 2);
        },
        onUnlock: function() {
            // unveilAction('neighborlyTies');
            unveilAction('meetPeople');
        },
        updateUpgradeMult:function() {
            let upgradeMult = 1;
            upgradeMult *= Math.pow(2, data.upgrades.haveBetterConversations.upgradePower);
            data.actions.socialize.upgradeMult = upgradeMult;
        },
        onLevelAtts:[["confidence", 1]],
        expAtts:[["confidence", 1], ["curiosity", 1], ["observation", 1], ["recognition", 1], ["charm", 1], ["influence", 1]],
        efficiencyAtts:[["confidence", .1]],
        // onCompleteText: {
        //     english:"+<b><span id=\"socializeActionPower\">1</span></b> Conversation<br>"
        // },
        actionPowerFunction: function(resource, origMult) {
            if(resource * origMult < 1) {
                return 0;
            }
            return Math.pow(Math.log10(resource * origMult), 3); //log10(num * mult)^3
        },
        onCompleteText: {english:Raw.html`
                +<span style="font-weight:bold;" id='socializeAmountToSend'>1</span> conversations in Meet People.<br>
                -<span style="font-weight:bold;" id='socializeMomentumTaken'>1</span> Momentum taken from this action.<br>`},
        extraInfo: {english:`<br>Exp & Conversations gain = log10(Momentum/100 * Action Power)^3 * Efficiency.`}
    },
    meetPeople: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:10, progressMaxIncrease:1.2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1,
        unlockCost:5, visible:false, unlocked:false, purchased: true, hasUpstream:false,
        onUnlock: function() {
            unveilAction('joinCoffeeClub');
            unveilAction('buySocialAccess');
            unveilAction('slideTheCoin');
        },
        onLevelAtts:[["recognition", 1], ["confidence", 1], ["discernment", 1]],
        expAtts:[],
        efficiencyAtts:[]
    },
    joinCoffeeClub: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:30000, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.001,
        unlockCost:50, maxLevel:1,
        visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('gossip');
            unveilAction('hearAboutTheLich');
        },
        onLevelAtts:[],
        expAtts:[["influence", 100], ["recognition", 1]],
        efficiencyAtts:[["influence", 100], ["recognition", 1]],
    },
    gossip: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:50, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1,
        unlockCost:5, maxLevel:10,
        visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function () {
            unveilAction('eatGoldenFruit');
        },
        onLevelAtts:[],
        expAtts:[["cunning", 10]],
        efficiencyAtts:[["discernment", 1], ["recognition", 1]],
    },
    hearAboutTheLich: {
        tier:2, plane:0, resourceName:"fear",
        progressMaxBase:200, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1,
        unlockCost:0, maxLevel:1,
        visible:false, unlocked:false, purchased: true, hasUpstream:false,
        onLevelCustom: function() {
            //Auto-shows KTL button on level via view updates
        },
        isUnlockCustom: function() {
            return data.actions.overclock.level >= 1;
        },
        onLevelAtts:[["integration", 20]],
        expAtts:[],
        efficiencyAtts:[],
        extraButton: Raw.html`
            <span class="button" id='killTheLichMenuButton2' onclick="openKTLMenu()" 
                style="display:none;padding:8px 13px;position:absolute;top:330px;left:100px;border-color:black;
                background-color:#880000;text-shadow:0 0 3px #ff0000;box-shadow:0 0 15px 4px rgba(255, 0, 0, 0.5);" >
            Kill the Lich!</span>
        `,
        unlockMessage:{english:"Unlocks when Overclock is level 1."},
        extraInfo: {english:Raw.html`This action gains (Total Momentum / 1 billion * .1% of Conversations on Gossip) Fear each Overclock complete, which is a gain of  
        <span style="font-weight:bold;" id="hearAboutTheLichActionPower">0</span>`}
    },

//--- From upgrades ---






};

//Shortcut pt 1
actionData = {
    ...actionData,

    watchBirds: {
        tier:1, plane:0,
        progressMaxBase:100000000, progressMaxIncrease:40,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:1,
        unlockCost:10000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('journal')
            unveilAction('catchAScent')
        },
        onLevelAtts:[["observation", 30]],
        expAtts:[["concentration", 1], ["curiosity", 1], ["awareness", 1]],
        efficiencyAtts:[]
    },
    catchAScent: {
        tier:1, plane:0,
        progressMaxBase:200000, progressMaxIncrease:5,
        expToLevelBase:5, expToLevelIncrease:1,
        efficiencyBase:.8, maxLevel:1,
        unlockCost:100000, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('stepOffToExplore')
        },
        onLevelAtts:[["observation", 120]],
        expAtts:[["curiosity", 1]],
        efficiencyAtts:[["navigation", 1]]
    },
    stepOffToExplore: {
        tier:1, plane:0,
        progressMaxBase:5000000, progressMaxIncrease:4,
        expToLevelBase:2, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:2,
        unlockCost:500000, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('questionTheTrail')
            data.actions.bodyAwareness.maxLevel += 2;
        },
        onUnlock: function() {
        },
        onLevelAtts:[["endurance", 90], ["navigation", 2.5]],
        expAtts:[["curiosity", 1]],
        efficiencyAtts:[["curiosity", 1]],
        extraInfo:{english:"On Level up: +2 max levels for Body Awareness."}
    },
    eatGoldenFruit: {
        tier:1, plane:0,
        progressMaxBase:2000000000, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:5,
        unlockCost:5000000, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
        },
        onUnlock: function () {
        },
        onLevelAtts:[["energy", 150], ["integration", 40]],
        expAtts:[["curiosity", 1], ["discernment", 1]],
        efficiencyAtts:[]
    },
    questionTheTrail: {
        tier:1, plane:0,
        progressMaxBase:2000000, progressMaxIncrease:5,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.5, maxLevel:2,
        unlockCost:1000000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            unveilAction('climbTheRocks')
            unveilAction('spotAShortcut')
        },
        onLevelAtts:[["navigation", 2.5]],
        expAtts:[["curiosity", 1]],
        efficiencyAtts:[["navigation", 1]]
    },
    journal: {
        tier:1, plane:0,
        progressMaxBase:4000, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1,
        unlockCost:50000, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('meditate')
        },
        onUnlock: function() {
            data.actions.bodyAwareness.maxLevel++;
        },
        onLevelAtts:[["awareness", 50], ["curiosity", 25]],
        expAtts:[["observation", 1], ["energy", 1]],
        efficiencyAtts:[["cycle", 1]],
        unlockMessage:{english:"On unlock, +1 max level for Body Awareness."}
    },
}

//Meditate
actionData = {
    ...actionData,

    meditate: { //purpose: take a while to ramp up, but slowly become the primary overclock increase for a while
        tier:1, plane:0,
        progressMaxBase:1e6, progressMaxIncrease:1.05, //req high initial, reduces with flow
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:4,
        unlockCost:10e6, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            unveilAction('feelTheAche')
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["awareness", 500], ["cycle", 1]],
        expAtts:[["awareness", 1], ["curiosity", 1], ["concentration", 1], ["flow", 1]],
        efficiencyAtts:[["flow", .1]]
    },
    feelTheAche: {
        tier:1, plane:0,
        progressMaxBase:5e5, progressMaxIncrease:1.05,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:1,
        unlockCost:2e6, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            unveilAction('softenTension')
        },
        onLevelCustom: function() {
            data.actions.meditate.maxLevel+=1
        },
        onLevelAtts:[["flow", 1]],
        expAtts:[],
        efficiencyAtts:[["flow", .1]],
        extraInfo:{english:"On Level up: +1 max level for Meditate."}
    },
    softenTension: {
        tier:1, plane:0,
        progressMaxBase:2e5, progressMaxIncrease:1.1,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.3, maxLevel:1,
        unlockCost:2e6, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            unveilAction('releaseExpectations')
        },
        onLevelCustom: function() {
            data.actions.feelTheAche.maxLevel+=1
        },
        onLevelAtts:[["flow", 2]],
        expAtts:[],
        efficiencyAtts:[["flow", .1]],
        extraInfo:{english:"On Level up: +1 max level for Feel The Ache."}
    },
    releaseExpectations: {
        tier:1, plane:0,
        progressMaxBase:2e5, progressMaxIncrease:1.1,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.4, maxLevel:20,
        unlockCost:2e6, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            data.actions.softenTension.maxLevel+=1
            // unveilAction('walkAware')
            // unveilAction('readTheWritten')
            // unveilAction('standStraighter')
        },
        onLevelAtts:[["flow", 3]],
        expAtts:[],
        efficiencyAtts:[["flow", .1]],
        extraInfo:{english:"On Level up: +1 max level for Soften Tension."}
    },
    walkAware: {
        tier:1, plane:0,
        progressMaxBase:250, progressMaxIncrease:1.1,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:100,
        unlockCost:2e6, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
}


//Training / Notice board level 2 / shortcut pt2
actionData = {
    ...actionData,

    reportForTraining: {
        tier:1, plane:0,
        progressMaxBase:1e6, progressMaxIncrease:1.4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.3, maxLevel:40,
        unlockCost:10, visible:false, unlocked:false, purchased: false,
        onLevelCustom:function() {
            if(data.actions.reportForTraining.level >= 30) {
                unveilAction('basicTrainingWithJohn');
            }
        },
        onLevelAtts:[["endurance", 1], ["energy", 1]],
        expAtts:[],
        efficiencyAtts:[]
    },
    basicTrainingWithJohn: {
        tier:1, plane:0,
        progressMaxBase:1e6, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelIncrease:1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        efficiencyBase:.2, maxLevel:40,
        unlockCost:1e7, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    noticeTheStrain: {
        tier:1, plane:0,
        progressMaxBase:1e6, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelIncrease:1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        efficiencyBase:.2, maxLevel:40,
        unlockCost:1e7, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    clenchTheJaw: {
        tier:1, plane:0,
        progressMaxBase:1e6, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelIncrease:1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        efficiencyBase:.2, maxLevel:40,
        unlockCost:1e7, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    breatheThroughIt: {
        tier:1, plane:0,
        progressMaxBase:1e6, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelIncrease:1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        efficiencyBase:.2, maxLevel:40,
        unlockCost:1e7, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    ownTheWeight: {
        tier:1, plane:0,
        progressMaxBase:1e6, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelIncrease:1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        efficiencyBase:.2, maxLevel:40,
        unlockCost:1e7, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    moveWithPurpose: {
        tier:1, plane:0,
        progressMaxBase:1e6, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelIncrease:1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        efficiencyBase:.2, maxLevel:40,
        unlockCost:1e7, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    climbTheRocks: {
        tier:1, plane:0,
        progressMaxBase:2000000000, progressMaxIncrease:2,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:5,
        unlockCost:4000000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[["concentration", 50]],
        expAtts:[["curiosity", 1], ["endurance", 10]],
        efficiencyAtts:[["endurance", 1]]
    },
    spotAShortcut: {
        tier:1, plane:0,
        progressMaxBase:200000000, progressMaxIncrease:3,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:3,
        unlockCost:4000000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[["navigation", 5]],
        expAtts:[["curiosity", 1], ["endurance", 1]],
        efficiencyAtts:[["endurance", 1]]
    },
    standStraighter: {
        tier:1, plane:0,
        progressMaxBase:250, progressMaxIncrease:1.1,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:100,
        unlockCost:2e6, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
}


//Jobs 1
actionData = {
    ...actionData,

    fillBasicNeeds: {
        tier:1, plane:0, resourceName: "gold",
        progressMaxBase:20, progressMaxIncrease:1.2,
        expToLevelBase:50, expToLevelIncrease:1.2,
        efficiencyBase:.6,
        unlockCost:50, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    chimneySweep: {
        tier:1, plane:0,
        progressMaxBase:1e6, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1.2,
        efficiencyBase:.1, maxLevel:8,
        wage: 20,
        unlockCost:1e6, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            data.actions.chimneySweep.wage += actionData.chimneySweep.wage/4;
            changeJob('chimneySweep');
            if(data.actions.chimneySweep.level >= 2) {
                unveilAction('handyman');
            }
        },
        onUnlock:function() {
            changeJob('chimneySweep');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        unlockMessage:{english:"On unlock, set job to Chimney Sweep for a base wage of $500."}
    },
    handyman: {
        tier:1, plane:0,
        progressMaxBase:1e9, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1.2,
        efficiencyBase:.05, maxLevel:8,
        wage: 40,
        unlockCost:1e9, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            data.actions.handyman.wage += actionData.handyman.wage/4;
            changeJob('handyman');
            if(data.actions.handyman.level >= 2) {
                unveilAction('tavernHelper');
            }
        },
        onUnlock:function() {
            changeJob('handyman');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        unlockMessage:{english:"On unlock, set job to Handyman for a base wage of $25k."}
    },
    tavernHelper: {
        tier:1, plane:0,
        progressMaxBase:1e12, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1.2,
        efficiencyBase:.025, maxLevel:8,
        wage: 80,
        unlockCost:1e12, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            data.actions.tavernHelper.wage += actionData.tavernHelper.wage/4;
            changeJob('tavernHelper');
            if(data.actions.tavernHelper.level >= 2) {
                unveilAction('guildReceptionist');
            }
        },
        onUnlock:function() {
            changeJob('tavernHelper');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        unlockMessage:{english:"On unlock, set job to tavernHelper for a base wage of $1.25m."}
    },
    guildReceptionist: {
        tier:1, plane:0,
        progressMaxBase:1e15, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1.2,
        efficiencyBase:.0125, maxLevel:8,
        wage: 160,
        unlockCost:1e15, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            data.actions.guildReceptionist.wage += actionData.guildReceptionist.wage/4;
            changeJob('guildReceptionist');
            if(data.actions.guildReceptionist.level >= 2) {
                unveilAction('messenger');
            }
        },
        onUnlock:function() {
            changeJob('guildReceptionist');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        unlockMessage:{english:"On unlock, set job to guildReceptionist for a base wage of $100m."}
    },
    messenger: {
        tier:1, plane:0,
        progressMaxBase:1e18, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1.2,
        efficiencyBase:.00625, maxLevel:8,
        wage: 350,
        unlockCost:1e18, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            data.actions.messenger.wage += actionData.messenger.wage/4;
            changeJob('messenger');
            if(data.actions.messenger.level >= 2) {
                unveilAction('townCrier');
            }
        },
        onUnlock:function() {
            changeJob('messenger');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        unlockMessage:{english:"On unlock, set job to messenger for a base wage of $5b."}
    },
    townCrier: {
        tier:1, plane:0,
        progressMaxBase:1e21, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1.2,
        efficiencyBase:.003, maxLevel:8,
        wage: 700,
        unlockCost:1e21, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            data.actions.townCrier.wage += actionData.townCrier.wage/4;
            changeJob('townCrier');
            if(data.actions.townCrier.level >= 2) {
                unveilAction('storyTeller');
            }
        },
        onUnlock:function() {
            changeJob('townCrier');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        unlockMessage:{english:"On unlock, set job to townCrier for a base wage of $250b."}
    },
    storyTeller: {
        tier:1, plane:0,
        progressMaxBase:5e23, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1.2,
        efficiencyBase:.0015, maxLevel:8,
        wage: 1500,
        unlockCost:5e24, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            data.actions.storyTeller.wage += actionData.storyTeller.wage/4;
            changeJob('storyTeller');
        },
        onUnlock:function() {
            changeJob('storyTeller');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        unlockMessage:{english:"On unlock, set job to storyTeller for a base wage of $20t."}
    },
}


//TODO..
actionData = {
    ...actionData,

    readTheWritten: {
        tier:1, plane:0,
        progressMaxBase:10000000, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.05,
        unlockCost:50000000, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
        },
        onUnlock: function() {
        },
        onLevelAtts:[["awareness", 1000], ["curiosity", 500]],
        expAtts:[["observation", 1], ["energy", 1]],
        efficiencyAtts:[["cycle", 1]]
    },
    siftExcess: { //? dunno the purpose yet
        tier:1, plane:0,
        progressMaxBase:100000, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01,
        unlockCost:500000, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
        },
        onLevelAtts:[["cycle", 100]],
        expAtts:[["observation", 1]],
        efficiencyAtts:[]
    },

    gossipAboutPrices: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:50, progressMaxIncrease:1.5,
        expToLevelBase:2, expToLevelIncrease:1.5,
        unlockCost:50, maxLevel:10,
        visible:false, unlocked:false, purchased: false,
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            unveilAction('talkAboutMarkets');
        },
        expAtts:[],
        onLevelAtts:[["haggling", 1]],
        efficiencyAtts:[],
    },
    talkAboutMarkets: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:1e6, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelIncrease:1.5,
        unlockCost:1e6, visible:false, unlocked:false, purchased: false,
        maxLevel:10,
        onCompleteCustom:function() {
        },
        onUnlock: function() {
        },
        expAtts:[],
        onLevelAtts:[["haggling", 1]],
        efficiencyAtts:[],
    },
    //Socialize - Scott
    talkToScott: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:50000, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelIncrease:1.5,
        unlockCost:50000, maxLevel:10,
        visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            unveilAction('talkAboutVillageHistory');
            unveilAction('talkAboutCurrentIssues');
        },
        expAtts:[["scottFamiliarity", 1]],
        onLevelAtts:[["trust", 1]],
        efficiencyAtts:[],
    },
    talkAboutVillageHistory: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:50000, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:3,
        unlockCost:50000, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["villagersKnown", 1]],
        expAtts:[],
        efficiencyAtts:[],
    },
    talkAboutCurrentIssues: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:50000, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelIncrease:1.5,
        unlockCost:50000, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["villagersKnown", 1]],
        expAtts:[],
        efficiencyAtts:[],
    },
    //Socialize - John
    talkToInstructorJohn: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:50000, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelIncrease:1.5,
        unlockCost:50000, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["villagersKnown", 1]],
        expAtts:[],
        efficiencyAtts:[],
    },
    //Socialize - Local Outreach
    localOutreach: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:50000, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelIncrease:1.5,
        unlockCost:50000, maxLevel:50,
        visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["villagersKnown", 1]],
        expAtts:[],
        efficiencyAtts:[],
    },
}


//==== plane1 ====
actionData = {
    ...actionData,

    overclockTargetingTheLich: {
        tier:1, plane:1,
        progressMaxBase:60, progressMaxIncrease:1,
        expToLevelBase:60, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: false,
        unlockCost:0, visible:true, unlocked:true, isGenerator:true, generatorSpeed:1,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    killHorde: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:10,
        expToLevelBase:5, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: false, maxLevel:2,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.legacy += 10;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 2 * (1 +  data.actions.killHorde.level);
        },
        onLevelCustom: function() {
            unveilAction('killElites');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"Gives 2 * (1 + level) legacy per complete."},
        unlockMessage:{english:"On unlock, +10 legacy."}
    },
    killElites: {
        tier:1, plane:1,
        progressMaxBase:1e13, progressMaxIncrease:10,
        expToLevelBase:5, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: false, maxLevel:2,
        unlockCost:1e12, visible:true, unlocked:false,
        onUnlock: function() {
            data.legacy += 30;
        },
        onCompleteCustom:function() {
            data.legacy += 6 * (1 +  data.actions.killHorde.level);
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"Gives 6 * (1 + level) legacy per complete."},
        unlockMessage:{english:"On unlock, +30 legacy."}
    },
    killDevils: {
        tier:1, plane:1,
        progressMaxBase:1e16, progressMaxIncrease:10,
        expToLevelBase:5, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: false, maxLevel:2,
        unlockCost:1e12, visible:true, unlocked:false,
        onUnlock: function() {
            data.legacy += 100;
        },
        onCompleteCustom:function() {
            data.legacy += 20 * (1 +  data.actions.killHorde.level);
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"Gives 20 * (1 + level) legacy per complete."},
        unlockMessage:{english:"On unlock, +100 legacy."}
    },
    killGenerals: {
        tier:1, plane:1,
        progressMaxBase:10, progressMaxIncrease:1.2,
        expToLevelBase:1, expToLevelIncrease:1.2,
        efficiencyBase:1, isKTL:true, purchased: false,
        unlockCost:10, visible:true, unlocked:false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
}

//==== plane2 ====
actionData = {
    ...actionData,


    echoKindle: {
        tier:1, plane:2,
        progressMaxBase:60, progressMaxIncrease:1,
        expToLevelBase:60, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: false,
        unlockCost:0, visible:true, unlocked:true, isGenerator:true, generatorSpeed:1,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

}

//==== plane3 ====
actionData = {
    ...actionData,

    absorbStarseed: {
        tier:1, plane:3,
        progressMaxBase:60, progressMaxIncrease:1,
        expToLevelBase:60, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: false,
        unlockCost:0, visible:true, unlocked:true, isGenerator:true, generatorSpeed:1,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
}
