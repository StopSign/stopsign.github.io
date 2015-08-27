//Enable Travel
// rotate button pictures - reward only at end

//FUTURE:
//Replace button with pictures
//Background graphics
//Image icons for all upgrades
//window icon
//prestige based on fame

//Idle improvements
//1:
//new tab - Weapons - Super Manual and improve "do quest" part - requires Travel - new resource Gold - gives critstrike level 1 on buy
//1: Critical Strike Chance - Create special spots on the "Do Quest" part for critical dmg, improves frequency and size. Chance is 20 + 2% * #, costs gold to up
//2: Critical Strike Damage - gold and JP, improved by Carry More Stuff - gold = CMS*1.1^#, JPMult *= 1+#/2, costs gold to up
//3: Greedy - You want every penny - Get more gold on journey completion, gold = CMS*1.2^#, costs gold to up
//4:
//new tab - Mana - new resource Mana - staggered benefits - icon is replaced by 3 spells & one upgrade - requires travel
//Upgrade: Auto use spells (expensive) - level 1 auto use enable 1, level 2 auto use enable 2, level 3 auto use enable 3, level 4 smart auto enable all
//Spell 1 - Consume Mana, take logX(mana, .1) from pool as JPMult, autoactivates at full mana if on
//Spell 2 - Buff, 40% mana, lasts (x+5)^2 seconds, 30% Journey completion required
//Spell 3 - Bonus Regen - Refills mana by 100%, upgrades reduce cooldown by 10% per #, cooldown starts at 10 minutes
//1: Higher max mana pool increases by fibbonacci
//2:
//3: mana pool regen upgrade -
//4: improve regen more
//new tab - Luck - new resource Clovers - Mixed - he gives you 1 clover to start - requires all others
//1: chance to find clovers per quest completed is improved
//2: Chance to gain more mana
//3: Chance to find more gold
//4: Chance to skip travel
//5: Chance to gain a permanent basic building per journey w/o upping cost

var version;
var journeyPoints;
var questsDone;
var questMax;
var questMaxHelper1;
var questMaxHelper2;
var questMaxHelper3;
var questMaxHelper4;
var costReductionPerQuest;
var jpChange;
var jpMult;
var totalCompletions; //this reset
var fame; //eventually, prestige token
var questCompleteMultiplier;
var clickMultOption;
var buttonCosts;
var buttonValue;
var buttonNextValue;
var buttonCounts;
var JPPS;
var threshold;
var guidanceCost;
//basic, EXP, Travel, Mana, Weapons, Luck
var guidanceBought;
var expCurr;
var expMax;
var level;
var comboMult;
var tripStage;
var horses;
var horseChance;
var extraSleepWalking;
var extraSleepTraining;
var sleepWalkingMult;
displayOption = 0;
overkill = 0;
idleJPToGain = 0;
JPToGain = 0;
loadDefaults();

function loadDefaults() {
    version = ".1";
    journeyPoints = 0;
    questsDone = 0;
    questMax = 4;
    questMaxHelper1 = 1;
    questMaxHelper2 = 1;
    questMaxHelper3 = 1;
    questMaxHelper4 = 1;
    costReductionPerQuest = .975;
    jpChange = 1;
    jpMult = 1;
    totalCompletions = 0;
    fame = 0;
    questCompleteMultiplier = 1;
    clickMultOption = 0;
    buttonCosts = [7, 3, 30, 200, 0, 0, 0, 100000000000, 1000000, 1, 1, 20000, 80000, 8000, 300000,  12000,  30000,  80000];
    buttonValue = [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0];
    buttonNextValue = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    buttonCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    JPPS = 0;
    threshold = 0;
    guidanceCost = 10000;
    guidanceBought = [1, 0, 0, 0, 0, 0];
    expCurr = 0;
    expMax = 1;
    level = 0;
    comboMult = 1;
    tripStage = 0;
    horses = 0;
    horseChance = 0;
    extraSleepWalking = 0;
    extraSleepTraining = 0;
    sleepWalkingMult = 1;
}
function logX(x, effect) {
    return Math.log(x) / effect;
}
function changeClickMult(id) {
    clickMultOption = parseInt(id.substring(id.length-1));
    for(count = 0; count < 4; count++) {
        document.getElementById('clickMult' + count).className = 'clickMultiplier';
    }
    if(document.getElementById('clickMult' + clickMultOption)) {
        document.getElementById('clickMult' + clickMultOption).className = 'selectedMultiplier';
    }
}

function saveIntoStorage() {
    localStorage.allVariables4 = "";
    theCookie = version+","+journeyPoints+","+questsDone+","+questMax+","+questMaxHelper1+","+questMaxHelper2+","+questMaxHelper3+","+questMaxHelper4+","+costReductionPerQuest+","+jpChange+","+
        jpMult+","+totalCompletions+","+fame+","+questCompleteMultiplier+","+clickMultOption+","+JPPS+","+threshold;
    for(index = 0; index < buttonCosts.length; index++) {
        theCookie = theCookie+","+buttonCosts[index]+","+buttonValue[index]+","+buttonCounts[index]+","+buttonNextValue[index];
    }
    for(index = 0; index < guidanceBought.length; index++) {
        theCookie = theCookie+","+guidanceBought[index];
    }
    theCookie = theCookie+","+guidanceCost+","+expCurr+","+expMax+","+level+","+comboMult+","+tripStage+","+horses+
        ","+horseChance+","+extraSleepWalking+","+extraSleepTraining+","+sleepWalkingMult;
    localStorage.allVariables4 = theCookie;
}
function loadFromStorage() {
    if(localStorage.allVariables4) {
        expandedCookie = (','+localStorage.allVariables4).split(',');
        x = 1;
        version = parseFloat(expandedCookie[x++]);
        if(version == ".1") {
            journeyPoints = parseFloat(expandedCookie[x++]);
            questsDone = parseFloat(expandedCookie[x++]);
            questMax = parseFloat(expandedCookie[x++]);
            questMaxHelper1= parseFloat(expandedCookie[x++]);
            questMaxHelper2= parseFloat(expandedCookie[x++]);
            questMaxHelper3= parseFloat(expandedCookie[x++]);
            questMaxHelper4 = parseFloat(expandedCookie[x++]);
            costReductionPerQuest = parseFloat(expandedCookie[x++]);
            jpChange = parseFloat(expandedCookie[x++]);
            jpMult = parseFloat(expandedCookie[x++]);
            totalCompletions = parseFloat(expandedCookie[x++]);
            fame = parseFloat(expandedCookie[x++]);
            questCompleteMultiplier = parseFloat(expandedCookie[x++]);
            clickMultOption = parseFloat(expandedCookie[x++]);
            JPPS = parseFloat(expandedCookie[x++]);
            threshold = parseFloat(expandedCookie[x++]);
            for(index = 0; index < buttonCosts.length; index++) {
                buttonCosts[index]=parseFloat(expandedCookie[x++]);
                buttonValue[index]=parseFloat(expandedCookie[x++]);
                buttonCounts[index]=parseFloat(expandedCookie[x++]);
                buttonNextValue[index]=parseFloat(expandedCookie[x++]);
            }
            for(index = 0; index < guidanceBought.length; index++) {
                guidanceBought[index] = parseFloat(expandedCookie[x++]);
            }
            guidanceCost = parseFloat(expandedCookie[x++]);
            expCurr = parseFloat(expandedCookie[x++]);
            expMax = parseFloat(expandedCookie[x++]);
            level = parseFloat(expandedCookie[x++]);
            comboMult = parseFloat(expandedCookie[x++]);
            tripStage = parseFloat(expandedCookie[x++]);
            horses = parseFloat(expandedCookie[x++]);
            horseChance = parseFloat(expandedCookie[x++]);
            extraSleepWalking = parseFloat(expandedCookie[x++]);
            extraSleepTraining = parseFloat(expandedCookie[x++]);
            sleepWalkingMult = parseFloat(expandedCookie[x++]);
        }
    }
    updateButtonFields();
    updateFields();
    changeClickMult('clickMult'+clickMultOption);
    document.getElementById("guidanceHover1").style.display="none";
    document.getElementById("buyUpgrades").style.backgroundColor = "white";
    setGuidanceTabs();
    switchTopRightTabs("topRightTab0");
    switchTopMiddleTabs("topMiddleTab0");
    saveIntoStorage();
}
loadFromStorage();

function clearStorage() {
    localStorage.allVariables="";
    loadDefaults();
    updateButtonFields();
    updateFields();
    setGuidanceTabs();
    switchTopRightTabs("topRightTab0");
    document.getElementById("clickMe").innerHTML = "Gotta do quests!!";
    returnTravels=0;
    travelMult = 10;
    maxChance = 0;
}

horseUsed = 0;
function getSkipCount() {
    if(horses > 0 && horseUsed == 0) {
        horses--;
        horseUsed = 1;
        return 2000;
    }
    amountSkipped = 1;
    rand = Math.random() * 100;
    while(rand < maxSkipChance) {
        maxSkipChance = maxSkipChance - rand;
        amountSkipped++;
        rand = Math.random() * 100;
    }
    document.getElementById("amountSkipped").innerHTML = amountSkipped - 1;
    maxSkipChance = buttonValue[16];
    return amountSkipped;
}

clicks = 0;
returnTravels = 0;
travelMult = 7;
maxChance = 0;
maxSkipChance = 0;
function increment() {
    if(!guidanceBought[2]) {
        JPToGain = jpChange * jpMult;
        journeyPoints = journeyPoints + JPToGain;
    }
    else { //Travel enabled
        if(tripStage == 1) {
            skipCount = getSkipCount();
            stageDone = true;
            rand = Math.random() * 100;
            while(rand < maxChance && skipCount != 0) {
                maxChance = maxChance - rand;
                travelMult += 2.5;
                skipCount--;
                stageDone = false;
                returnTravels++;
                rand = Math.random() * 100;
            }
            document.getElementById("distance").innerHTML = returnTravels;
            if(stageDone || horseUsed) {
                tripStage++;
            }
        }
        else if(tripStage == 3 && returnTravels > 0) {
            skipCount = getSkipCount();
            returnTravels=returnTravels - skipCount;
            if(returnTravels < 0) returnTravels = 0;
            if(horseUsed) {
                tripStage++;
                horseUsed = 0;
                returnTravels = 0;
            }
        }
        else {
            tripStage++;
        }
        if(tripStage > 4) {
            tripStage = 0;
            JPToGain = jpChange * jpMult * travelMult;
            journeyPoints = journeyPoints + JPToGain;
            travelMult = 7;
            maxChance = buttonValue[15];
        }
        setQuestImages();
    }
    clicks++;
    checkQuest();
}

timer = 0;
updateCPS = 0;
setInterval(function() {
    idleJPToGain = JPPS * jpMult * comboMult;
    comboMult = comboMult * buttonValue[13];
    journeyPoints = journeyPoints + idleJPToGain;
    gainExp(idleJPToGain);
    if(Math.random() < horseChance) {
        horses++;
        horseChance = 0;
    }
    else {
        horseChance += buttonValue[17] / 100;
        document.getElementById("horseChance").innerHTML = round3(horseChance*100)+"%";
    }
    checkQuest();
    if(updateCPS > 3) {
        updateCPS = 0;
        cpsDiv = document.getElementById("CPS");
        cpsDiv.innerHTML = Math.ceil(clicks/2);
        if(Math.ceil(clicks/2) > 25) {
            cpsDiv.style.color="red";
            cpsDiv.innerHTML = cpsDiv.innerHTML + " autoclicking jerk";
        }
        else {
            cpsDiv.style.color="initial";
        }
        clicks = 0;
    }
    updateCPS++;
},500);

function checkQuest() {
    if(journeyPoints >= questMax) {
        comboMult = 1;
        firstTime = true;
        while(journeyPoints >= questMax) {
            journeyPoints = journeyPoints - questMax;
            if(firstTime) {
                journeyPoints = journeyPoints * buttonValue[14];
                overkill = journeyPoints;
                firstTime = false;
            }
            totalCompletions++;
            //Modify questhelpers
            questMaxHelper1 += .3 * questMaxHelper2 * questMaxHelper2;
            questMaxHelper2 *= 1.001;
            questMaxHelper3 += questMaxHelper1/8;
            questMaxHelper4=1 + Math.pow(totalCompletions/750,.7)+Math.pow(totalCompletions/2000,.7)*4;

            questMax = questMaxFormula();
            console.log(questMax+" 1:"+questMaxHelper1+" 2:"+questMaxHelper2+" 3:"+questMaxHelper3+" 4:"+questMaxHelper4);
            fame++;
            questsDone = questsDone + questCompleteMultiplier;
            for	(index1 = 0; index1 < buttonCosts.length; ++index1) {
                buttonCosts[index1] = buttonCosts[index1] * costReductionPerQuest;
            }
            guidanceCost = guidanceCost * costReductionPerQuest;
        }
    }
    updateButtons();
    updateButtonFields();
    updateFields();
    saveIntoStorage();
}
function questMaxFormula() {
    return ((questMaxHelper1 + questMaxHelper2+questMaxHelper3)*questMaxHelper4)/ (1 + buttonValue[0] / 100); //5 * Math.pow(1.02, totalCompletions) / (1 + buttonValue[0] / 100); //questMax formula
}
function buy(divId, updateButton) {
    id = parseInt(divId.substring(3));
    if((guidanceBought[1] == 0 && (id==11||id==12||id==13||id==14)) ||
        (guidanceBought[2] == 0 && (id==15||id==16||id==17))) {
        return;
    }
    buyCount = 1;
    if(clickMultOption == 1) buyCount = 5;
    halfQuestsDone = questsDone / 2;
    while(buttonCosts[id] < questsDone && buyCount > 0) {
        if(clickMultOption == 2 && halfQuestsDone > (questsDone - buttonCosts[id])) break;
        questsDone = questsDone - buttonCosts[id];
        buttonCounts[id]++;
        uniqueButtonCosts(id);
        if(clickMultOption == 0 || !updateButton) buyCount = 0;
        if(clickMultOption == 1) buyCount--;
    }
    if(updateButton){ updateButtonFields();
        updateFields();
    }
}
function round3(num) {
    return (Math.floor(num * 1000) / 1000).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function updateButtons() {
    for	(var index2 = 0; index2 < buttonCounts.length; index2++) {
        if(document.getElementById("costbuy"+index2) && document.getElementById("costbuy"+index2) != null) {
            if(buttonCosts[index2] < threshold) {
                buy('buy'+index2, false);
            }
        }
    }
}
function updateButtonFields() {
    updateButtonValues();
    for	(var index3 = 0; index3 < buttonCounts.length; index3++) {
        if(document.getElementById("costbuy"+index3) && document.getElementById("costbuy"+index3) != null) {
            document.getElementById("costbuy"+index3).innerHTML = round3(buttonCosts[index3]);
            document.getElementById("valuebuy"+index3).innerHTML = round3(buttonValue[index3]);
            document.getElementById("buycounts"+index3).innerHTML = round3(buttonCounts[index3]);
            document.getElementById("nextValuebuy"+index3).innerHTML = round3(buttonNextValue[index3]);
        }
    }
    document.getElementById("extra1").innerHTML = extraSleepWalking;
    document.getElementById("extra2").innerHTML = extraSleepTraining;
}

function toggleDisplay() {
    displayOption++;
    if(displayOption > 1)
        displayOption = 0;
    updateFields();
}

function updateFields() {
    if(displayOption == 0) {
        document.getElementById("questProgress1").innerHTML = round3(journeyPoints);
        document.getElementById("questProgress2").innerHTML = round3(questMax);
        document.getElementById("overkill").innerHTML = round3(overkill);
        document.getElementById("JPGain").innerHTML = round3(idleJPToGain);
        document.getElementById('clickGain').innerHTML = round3(JPToGain);
    }
    else if(displayOption == 1) {
        document.getElementById("questProgress1").innerHTML = round3(journeyPoints / questMax*100)+"%";
        document.getElementById("questProgress2").innerHTML = "100%";
        document.getElementById("overkill").innerHTML = round3(overkill / questMax*100)+"%";
        document.getElementById("JPGain").innerHTML = round3(idleJPToGain / questMax*100)+"%";
        document.getElementById('clickGain').innerHTML = round3(JPToGain / questMax*100)+"%";
    }
    document.getElementById("questProgress1").style.color = "hsl("+(Math.floor(journeyPoints / questMax*100))+", 100%, 45%)";

    document.getElementById("display").innerHTML = round3(questsDone);
    document.getElementById('fame').innerHTML = fame;
    document.getElementById("guidanceCost").innerHTML = round3(guidanceCost);
    document.getElementById("level").innerHTML = level;
    document.getElementById("progressBar").setAttribute("value", expCurr);
    document.getElementById("horses").innerHTML = horses;
    if(!guidanceBought[2]) {
        document.getElementById("horsieDiv").style.display="none";
        document.getElementById("travelInfo").style.display = "none";
    }
    else {
        document.getElementById("horsieDiv").style.display="inline-block";
        document.getElementById("travelInfo").style.display = "block";
    }
    document.getElementById("expDiv").style.display = guidanceBought[1] == 1 ? "inline-block" : "none";
}


function uniqueButtonCosts(id) {
    if(id == 0) { buttonCosts[id] = buttonCosts[id] * 4; } //Walk Faster
    if(id == 1) { buttonCosts[id] = buttonCosts[id] * 1.25; } //Look Closer
    if(id == 2) { buttonCosts[id] = buttonCosts[id] * 7; } //breathe better
    if(id == 3) { buttonCosts[id] = buttonCosts[id] * 9; } //Carry More Stuff
    if(id==7) {  //Sleep Walk Montage
        buttonCosts[id] = buttonCosts[id] * 75;
        extraSleepTraining+=buttonCounts[id];
        extraSleepWalking+=buttonCounts[8]+extraSleepTraining;
    }
    if(id==8) {  //Sleep Walk Training
        buttonCosts[id] = buttonCosts[id] * 35;
        extraSleepWalking+=buttonCounts[id]+extraSleepTraining;
    }
    if(id==9) { buttonCosts[id] = buttonCosts[id] * 1.5; } //Sleep Walking
    if(id==9) { buttonCosts[id] = buttonCosts[id] * 1.5; } //Auto-buy
    if(id==10) { buttonCosts[id] = buttonCosts[id] * 50; } //Sleep Walk Purchasing
    if(id==11) { buttonCosts[id] = buttonCosts[id] * 1.3; } //Memory Lessons
    if(id==12) { buttonCosts[id] = buttonCosts[id] * 6; } //Combat Lessons
    if(id==13) { buttonCosts[id] = buttonCosts[id] * 40; } //Combo
    if(id==14) { buttonCosts[id] = buttonCosts[id] * 40; } //Overkill
    if(id==15) { buttonCosts[id] = buttonCosts[id] * 8; } //Exotic Destinations
    if(id==16) { buttonCosts[id] = buttonCosts[id] * 4; } //Shortcuts
    if(id==17) { buttonCosts[id] = buttonCosts[id] * 6; } //Horses
    updateButtonValues();
}

function updateButtonValues() {
    //Walk Faster
    buttonValue[0] = buttonCounts[0] == 0 ? 0 : 10*buttonCounts[0];
    buttonNextValue[0] = 10*(buttonCounts[0]+1);
    questMax = questMaxFormula();

    //Look CLoser
    buttonValue[1] = (buttonCounts[1]+1) * buttonValue[12];
    buttonNextValue[1] = (buttonCounts[1]+2) * buttonValue[12];
    jpChange = buttonValue[1];

    //breathe better
    buttonValue[2] = (buttonCounts[2]) * buttonValue[12]/8+1;
    buttonNextValue[2] = (buttonCounts[2]+1) * buttonValue[12]/8+1;
    jpMult = buttonValue[2];

    //Carry More Stuff
    buttonValue[3] = buttonCounts[3]+1;
    buttonNextValue[3] = buttonCounts[3]+2;
    questCompleteMultiplier = buttonValue[3];

    //Sleep Montage
    buttonValue[7] = buttonCounts[7];
    buttonNextValue[7] = (buttonCounts[7]+1);

    //Sleep Training
    buttonValue[8] = buttonCounts[8]+extraSleepTraining;
    buttonNextValue[8] = (buttonCounts[8]+1)+extraSleepTraining;
    sleepWalkingMult= .03 * buttonCounts[7] + (buttonCounts[8] +extraSleepTraining) * .001 + + 1;

    //Sleep Walking
    buttonValue[9] = (buttonCounts[9]+extraSleepWalking) * sleepWalkingMult;
    buttonNextValue[9] = ((1*buttonCounts[9]+1)+extraSleepWalking) * sleepWalkingMult;
    JPPS = buttonValue[9];

    //Auto-buy
    buttonValue[10] =buttonCounts[10];
    buttonNextValue[10] = buttonCounts[10]+1;
    threshold = buttonValue[10];

    //Memory Lessons
    buttonValue[11] = 10*buttonCounts[11];
    buttonNextValue[11] = 10*(buttonCounts[11]+1);

    //Combat Lessons
    buttonValue[12] = buttonCounts[12] == 0 ? 1 : Math.pow(Math.sqrt((1 + level/1000)*buttonCounts[12]), .2);
    buttonNextValue[12] = Math.pow(Math.sqrt((1 + level/1000)*(buttonCounts[12]+1)), .2);

    //Combo
    buttonValue[13] = buttonCounts[13] == 0 ? 1 : Math.pow(1.001, buttonCounts[13]) * (1 + level/100000);
    buttonNextValue[13] = Math.pow(1.001, buttonCounts[13]+1) * (1 + level/100000);

    //Overkill
    buttonValue[14] = buttonCounts[14] == 0 ? 1 : 1 + Math.sqrt(Math.pow(level, .2)*buttonCounts[14])/10;
    buttonNextValue[14] = 1 + Math.sqrt(Math.pow(level, .2)*(1+buttonCounts[14]))/10;

    //Exotic Destinations
    buttonValue[15] = Math.sqrt(buttonCounts[15]*100)*2;
    buttonNextValue[15] = Math.sqrt((buttonCounts[15]+1)*100)*2;

    //Shortcuts
    buttonValue[16] = 1 * buttonCounts[16];
    buttonNextValue[16] = 1 * (buttonCounts[16]+1);

    //Wild Horses
    buttonValue[17] = .001 * buttonCounts[17];
    buttonNextValue[17] = .001 * (buttonCounts[17]+1);
}

timesDoneThis = 0;
function buyGuidance(theDiv) {
    id = parseInt(theDiv.id.substring(14));
    if(guidanceCost < questsDone)
    {
        questsDone = questsDone - guidanceCost;
        rateOfChange = 10000 * Math.pow(10, timesDoneThis++);
        guidanceCost *= rateOfChange;
        guidanceBought[id] = 1;
        if(guidanceBought[2]) {
            setQuestImages();
        }
        document.getElementById("guidanceHover"+id).style.display="none";
        document.getElementById("buyUpgrades").style.backgroundColor = "white";
        setGuidanceTabs();
        if(id == 1 && !guidanceBought[2]) {
            buttonCosts[15] *= rateOfChange;
            buttonCosts[16] *= rateOfChange;
            buttonCosts[17] *= rateOfChange;
        }
        if(id == 2 && !guidanceBought[1]) {
            buttonCosts[11] *= rateOfChange;
            buttonCosts[12] *= rateOfChange;
            buttonCosts[13] *= rateOfChange;
            buttonCosts[14] *= rateOfChange;
        }
    }
}

function switchTopRightTabs(tabId) {
    id = tabId.substring(11);
    for(x = 0; x < 6; x++)
    {
        if(document.getElementById('topRightTab'+x)) {
            document.getElementById('topRightTab'+x).style.color='#009CB9';
        }
        if(document.getElementById('questsType'+x)) {
            document.getElementById('questsType'+x).style.display='none';
        }
    }
    document.getElementById('topRightTab'+id).style.color='#ff0003';
    document.getElementById('questsType'+id).style.display='inline-block';
}

function switchTopMiddleTabs(tabId) {
    id = tabId.substring(12);
    if(id == 0) {
        document.getElementById("topMiddleTab0").style.color="#ff0003";
        document.getElementById("topMiddleTab1").style.color="#009CB9";
        document.getElementById("displayDiv").style.display="inline-block";
        document.getElementById("optionsDiv").style.display="none";
    }
    else if(id == 1) {
        document.getElementById("topMiddleTab0").style.color="#009CB9";
        document.getElementById("topMiddleTab1").style.color="#ff0003";
        document.getElementById("optionsDiv").style.display="inline-block";
        document.getElementById("displayDiv").style.display="none";
    }
}

function setGuidanceTabs() {
    showSomething = false;
    for(x = 0; x < 6; x++)
    {
        if(document.getElementById('topRightTab'+x)) {
            document.getElementById('topRightTab'+x).style.display = guidanceBought[x] == 1 ? "inline-block" : "none" ;
        }
        if(document.getElementById("guidanceType"+x)) {
            showSomething = !guidanceBought[x] || showSomething;
            document.getElementById('guidanceType'+x).style.display = guidanceBought[x] == 1 ? "none" : "inline-block";
        }
    }
    if(!showSomething) {
        document.getElementById("guidanceHover1").style.display="none";
        document.getElementById("buyUpgrades").style.backgroundColor = "white";
    }
}


function gainExp(toGain) {
    toGain = Math.pow(toGain,.5);
    document.getElementById('expGain').innerHTML=round3(toGain);
    if(guidanceBought[1] == 0)
        return;

    expCurr += toGain;
    expToUse = expMax / (buttonValue[11]+1);
    while(expCurr >= expToUse) {
        expCurr = expCurr - expToUse;
        level++;
        expMax = level + expMax;
        expToUse = expMax / (buttonValue[11]+1);
    }
    document.getElementById("expMax").innerHTML = round3(expToUse);
    document.getElementById("progressBar").setAttribute("max", expToUse);
}

function guidanceHover(theDiv) {
    id = theDiv.id.substring(12);
    for(x = 0; x < 6; x++) {
        if(document.getElementById("guidanceHover"+x))
            document.getElementById("guidanceHover"+x).style.display="none";
    }
    document.getElementById("guidanceHover"+id).style.display="inline-block";
    document.getElementById("buyUpgrades").style.backgroundColor=theDiv.style.backgroundColor;
}

function setQuestImages() {
    if(tripStage == 0) {
        document.getElementById("clickMe").innerHTML = "Get a New Quest!";
        document.getElementById("clickMe").style.borderColor = "green";
    }
    else if(tripStage == 1) {
        document.getElementById("clickMe").innerHTML = "Travelling...";
    }
    else if(tripStage == 3) {
        document.getElementById("clickMe").innerHTML = "Travelling back...";
    }
    else if(tripStage == 2) {
        document.getElementById("clickMe").innerHTML = "Do the Quest!!";
    }
    else if(tripStage == 4) {
        document.getElementById("clickMe").innerHTML = "COMPLETE THE QUEST!!!";
        document.getElementById("clickMe").style.borderColor = "red";
    }
}