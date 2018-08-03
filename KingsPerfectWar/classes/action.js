// Action constructor
window._Actions = {};
let _Action = function (params) {

    // debug mode will show suggestions for the action, based on the used params. Warnings should be taken care of, logs can be ignored.
    // turning debug off will hide the debugs, and also the [possible>path>to>texts] hidden
    // turning debug on for a given action will show all possible text keys in the UI, in order to know what key to use to add a text somewhere specific.
    this.debug = (typeof(params.debug) === "undefined" ? false : params.debug);

    let minimalKeys = ['id','xmlKey','townNum']; // absolutely needed, will trigger an error if absent
    let minimalLabels = ['label','tooltip']; // should be used in most case, wil trigger a warning if absent in debug mode

    // ckeck the keys of param, and the labels if in debug mode
    let missingKeys = [];
    $(minimalKeys).each(function(x,k) {
        if(typeof(params[k]) === "undefined")
            missingKeys.push(k);
    });
    if (missingKeys.length>0) {
        console.error("Creating a new action using params ",params," with missing keys, needed to work (minimal Action functionality) : ",missingKeys.join(", "));
        return false;// only hard stop, this is the minimal keys needed.
    }
    if (typeof(window._Actions[params.id]) !== "undefined") {
        console.error("Creating a new action using params ",params," but another action with the same id is already declared");
        return false;
    }

    if(this.debug) {
        let missingLabels = [];
        $(minimalLabels).each(function(x,k) {
            if(_txt("actions>"+params.xmlKey+">"+k,undefined,false) === "")
                missingLabels.push(k);
        });
        if (missingLabels.length>0) {
            console.warn("Creating a new action using params ",params," with missing commonly used text (in actions>"+params.xmlKey+">*) : ",missingLabels.join(", "));
        }
        if (typeof(params.manaCost) === "undefined")
            console.log("Creating a new action using params ",params," with no manaCost param, 0 used.");
        if (typeof(params.manaCost) === "undefined")
            console.log("Creating a new action using params ",params," with no visible param, true used.");
        if (typeof(params.manaCost) === "undefined")
            console.log("Creating a new action using params ",params," with no unlocked param, true used.");
        if ((typeof(params.finish) === "undefined") && (typeof(params.loot) === "undefined")  && (typeof(params.progress) === "undefined"))
            console.log("Creating a =new action using params ",params," with no loot, progress, nor finish param.");
        if (typeof(params.stats) === "undefined")
            console.log("Creating a new action using params ",params," with no stats param. No XP awarded.");
    }


    // we can start preparing the Action object

    // basic action identifiers and texts are needed
    this.id = params.id; // used to recognise the action and access it. Usually associated with the let name used when declaring the action.
    this.townNum = typeof(params.townNum) === "int" ? [params.townNum] : params.townNum; // used to know in what city to show. Can be passed as an array to use in multiple cities
    this.label = _txt("actions>"+params.xmlKey+">label",undefined,this.debug); // short label shown in the front
    this.tooltip = _txt("actions>"+params.xmlKey+">tooltip",undefined,this.debug);

    // manacost : will always be a function, even if not declared. default 0
    this.manaCost = (typeof(params.manaCost) === "undefined") ? 0 : (
        typeof(params.manaCost) === "function" ? params.manaCost : function() {return params.manaCost;}
    )
    // visible : will always be a function, even if not declared. deffault true
    this.visible = (typeof(params.visible) == "undefined") ? true : (
        typeof(params.visible) === "function" ? params.visible : function() {return params.visible;}
    )
    // unlocked : will always be a function, even if not declared. deffault true
    this.unlocked = (typeof(params.unlocked) == "undefined") ? true : (
        typeof(params.unlocked) === "function" ? params.unlocked : function() {return params.unlocked;}
    )
    // affectedBy : will always be an array. Adds an image on the action div
    this.affectedBy = (typeof(params.affectedBy) === "undefined") ? [] :  params.affectedBy;

    // finish : will always be a function, even if not declared
    this.finish = (typeof(params.finish) === "undefined") ? function(){} : params.finish;
    // loot :  will always be an array, even if not declared
    this.loot = (typeof(params.loot) === "undefined") ? [] :  params.loot;
    // progress :  will always be an array, even if not declared
    let progress = {};
    let progresses = (typeof(params.progress) === "undefined") ? [] :  params.progress;
    $(progresses).each(function(x,p) {// each progress definition is processed to generate the UI elements needed
        let newProgress = new _Progress(p);
        if (newProgress === false) {
            console.error("Creating a new action using params ",params," with an invalid Progress definition : ",p);
        }

        progress[p.id] = newProgress;
    });
    this.progress = progress;
    // stats : will always be an object, even if not declared
    this.stats = (typeof(params.stats) == "undefined") ? {} : params.stats;
    // expMult : will always be an object, even if not declared. defaut 100% (1)
    this.expMult = (typeof(params.expMult) == "undefined") ? function(){return 1} : (
        typeof(params.expMult) == "function" ? params.expMult : function(){return params.expMult;}
    );

    this.labelDone = _txt("actions>"+params.xmlKey+">label_done",undefined,this.debug); // used in progress bar associated. not needed
    window._Actions[params.id] = this;
    return true;
};

_Action.prototype.Finish = function() {
    let hasProgressed = false;
    // next 2 lets are needed because the "this" context is lost in .each
    let progresses = this.progress;
    let _action  = this;
    $(Object.keys(this.progress)).each(function(x,p) {
        let progress = progresses[p];
        if (progress.update.call(progress,_action))  // if updating one of the progress results in a level up. progress.update returns true if there was a levelUp.
            hasProgressed = true; // then we need to update the loots linked to this action.
    });

    // if there was progress, we update the linked loots.
    if (hasProgressed)
        $(this.loot).each(function(x,l) {
            console.log(this);
            window._Loots[l].update(); // we update each loot
        });

    // finaly, we call the finish function for extra functionality not covered by loot or progress params
    this.finish.call(this);
};

window.Action_test = function() {
    // declaring pots
    new _Loot({
        id : "Pot", // used to be referenced in the _Action.loot param
        linkedTo : "WanderProgress", // UI element to link this loot to 
        xmlKey : "pot", // where to find the linked text in the XML
        oneEvery : 10,
        contents : [
            {
                type : 'mana',
                val : 100
            },
        ],
        count : function () {
            return _Actions.Wander.progress.WanderProgress.getLevel() * 5;
        },
    });
    new _Loot({
        id : "Lock",
        linkedTo : "WanderProgress",
        xmlKey : "lock",
        oneEvery : 10,
        contents : [
            {
                type : 'gold',
                val : 10,
                multiplier : function() {
                    let practical = getSkillLevel("Practical");
                    practical = practical <= 200 ? practical : 200;
                    return (1 + practical/100);
                },
            }
        ],
        count : function () {
            return _Actions.Wander.progress.WanderProgress.getLevel();
        },
    });

    new _Action({
        id : "Wander", // will create the action and put it in window._Actions.{action.id}. In this case, window._Actions.Wander
        debug : true,
        expMult : 1, // this is the defaut value, so if your action has an 100% XP scaling, no need to mention it. Can also be a function
        townNum : 0, // can now be an array to use the same action in multiple towns
        xmlKey : "wander",
        stats : {
            Per:.2,
            Con:.2,
            Cha:.2,
            Spd:.3,
            Luck:.1
        },
        affectedBy : ["BuyGlasses"],
        manaCost :  250,
        visible : true, // same here, function or static value
        unlocked : true, // same here, function or static value
        loot : ['Pot','Lock'],// use this instead of the finish function for corresponding loot update on finish
        progress : [
            {
                id : 'WanderProgress', // usefull if you need to access it from somewhere else. e.g. you want to make this progressbar advance in another action, do OtherAction.progress."this id", and use the accessible functions
                type : 'simple', // the classic progress bar
                difficulty : 1,// the scaling applied to the progress through the %
                onFinish : function() { // loot when this action finishes
                    return 200 * (glasses ? 4 : 1);
                }
            }
        ],
    });
    // console.log(_Wander);
    _Actions.Wander.Finish();
    // _Wander.test();
    // new _Action({});
};