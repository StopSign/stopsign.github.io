
function loadDebugValues() {

    debugStart()

    debug1stKill()
    debug2ndKill()
    debug3rdKill()


    debugAfterCare()

}

function debug3rdKill() {
    if(debugLevel >= 81) {
        data.legacy = 5e6;
        increaseLichKills();
        legacySeveranceReset(true)
    }
    if(debugLevel >= 100) {
        debugFirstFewLoops()
        data.ancientWhisper += 200;
        buyUpgrade("stopBeingSoTense")
        data.ancientCoin += 200;
        buyUpgrade("rememberHowIGrew")
        data.ancientCoin += 125;
        buyUpgrade("startCasualChats")
        buyUpgrade("startCasualChats")
    }
    if(debugLevel >= 115) {
        debugSecondFewLoops()
    }
    if(debugLevel >= 125) {
        debugThirdFewLoops()
    }
    if(debugLevel >= 140) {
        increaseLichKills();
        legacySeveranceReset(true)
    }
}

function debugFirstFewLoops() {
    //2 kills: 17 loops until all attributes cost >100
    //repose rebounded: level 12 / 802
    //6h: 2.42e50, 1.34|354|240

    data.legacy = 2.08e5
    data.actions.reposeRebounded.exp += 5500
    data.actions.turnTheWheel.exp += 5500
    data.ancientCoin += 1900;
    data.ancientWhisper += 1315;

    revealAction("echoKindle")
    revealAction("resonanceFurnace")
    unveilPlane(1);

    buyUpgrade("refineMyAwareness")
    buyUpgrade("refineMyAwareness")
    buyUpgrade("refineMyAwareness")
    buyUpgrade("refineMyConcentration")
    buyUpgrade("refineMyConcentration")
    buyUpgrade("refineMyControl")
    buyUpgrade("refineMyControl")
    buyUpgrade("refineMyEnergy")
    buyUpgrade("refineMyIntegration")
    buyUpgrade("refineMyAmplification")
    buyUpgrade("refineMyAmplification")
    buyUpgrade("refineMyPulse")
    buyUpgrade("refineMyCycle")
    buyUpgrade("refineMyAmbition")
    buyUpgrade("refineMyAmbition")
    buyUpgrade("refineMyAmbition")
    buyUpgrade("refineMyLeverage")
    buyUpgrade("refineMyLeverage")
    buyUpgrade("refineMySavvy")
    buyUpgrade("refineMyInfluence")
    buyUpgrade("refineMyInfluence")
    buyUpgrade("refineMyConfidence")
    buyUpgrade("refineMyConfidence")
    buyUpgrade("refineMyCharm")
    buyUpgrade("refineMyCharm")
    buyUpgrade("refineMyObservation")
    buyUpgrade("refineMyObservation")
    buyUpgrade("refineMyObservation")
    buyUpgrade("refineMyEndurance")
    buyUpgrade("refineMyEndurance")
    buyUpgrade("refineMyEndurance")
    buyUpgrade("refineMyMight")
    buyUpgrade("refineMyMight")
    buyUpgrade("refineMyMight")
    buyUpgrade("refineMyNavigation")
    buyUpgrade("refineMyNavigation")
    buyUpgrade("refineMyNavigation")
    buyUpgrade("refineMyWizardry")
    buyUpgrade("refineMyValor")
    buyUpgrade("refineMyImpedance")
    buyUpgrade("refineMyImpedance")
    buyUpgrade("refineMyImpedance")


    buyUpgrade("respectTheShrine")
    buyUpgrade("improveMyGrimoire")
    buyUpgrade("improveMyGrimoire")
    buyUpgrade("improveMyGrimoire")
    buyUpgrade("useMyGrimoiresPower")
    buyUpgrade("useMyGrimoiresPower")
    buyUpgrade("buyNicerStuff")
    buyUpgrade("buyNicerStuff")
    buyUpgrade("buyNicerStuff")
    buyUpgrade("shapeMyMana")
    buyUpgrade("shapeMyMana")
    buyUpgrade("shapeMyMana")
    buyUpgrade("useMoreComplexSpells")
    buyUpgrade("feelTheEchoesOfTheBurntTown")
    buyUpgrade("feelTheEchoesOfTheBurntTown")
    buyUpgrade("feelTheEchoesOfTheBurntTown")
    buyUpgrade("feelTheEchoesOfTheBurntTown")
    buyUpgrade("feelTheEchoesOfTheBurntTown")
    buyUpgrade("investMyCoins")
    buyUpgrade("investMyCoins")
    buyUpgrade("chatLongerWithAllies")
    buyUpgrade("chatLongerWithAllies")

    unlockAction(data.actions.dipInTheRiver)
    unlockAction(data.actions.prepareInfusion)
    unlockAction(data.actions.infuseBody)
    unlockAction(data.actions.infuseMind)

}

function buyUpgradesLessThan(num) {
    for(let i = 0; i < 20; i++) {
        for(let upgradeVar in upgradeData) {
            let upgradeObj = data.upgrades[upgradeVar];
            let upgradeDataObj = upgradeData[upgradeVar];

            if(upgradeDataObj.type === "unique" || upgradeDataObj.type === "attribute" || upgradeDataObj.type === "mult") {
                let cost = calcUpgradeCost(upgradeObj, upgradeObj.upgradesBought);
                if (cost <= num) {
                    buyUpgrade(upgradeVar)
                }
            }
        }
    }
}
function buyNewActionUpgradesLessThan(num) {
    for(let i = 0; i < 20; i++) {
        for(let upgradeVar in upgradeData) {
            let upgradeObj = data.upgrades[upgradeVar];
            let upgradeDataObj = upgradeData[upgradeVar];

            if(upgradeDataObj.type === "actions") {
                let cost = calcUpgradeCost(upgradeObj, upgradeObj.upgradesBought);
                if (cost <= num) {
                    buyUpgrade(upgradeVar)
                }
            }
        }
    }
}
function debugSecondFewLoops() {
    //2 kills: 13 loops until bought all upgrades <= 300
    //just unlocked lich again in NW
    //just reached learn from library
    //9h: 5.82e60, 1.55e5|2050|1200
    //RR: 15, 1200
    data.actions.reposeRebounded.exp += 5000
    data.actions.turnTheWheel.exp += 5000
    data.ancientCoin += 9000;
    data.ancientWhisper += 3000;
    data.legacy = 1.7e6

    buyNewActionUpgradesLessThan(700)
    buyUpgradesLessThan(300)

    buyUpgrade("increaseMarketCap")
    buyUpgrade("increaseMarketCap")
}

function debugThirdFewLoops() {
    data.ancientWhisper += 5300;

    data.ancientCoin += 9000;
    buyUpgradesLessThan(800)
    data.actions.reposeRebounded.exp += 1500
    data.actions.turnTheWheel.exp += 1500


    buyUpgrade("exploreTheLibrary")
    buyUpgrade("readTheOldBooks")
    buyUpgrade("shapeMyMana")
    buyUpgrade("spendMyFortune")

    data.legacy = 1e7
    data.actions.reposeRebounded.exp += 2000
    data.actions.turnTheWheel.exp += 2000

    data.ancientCoin += 35000;
    data.ancientWhisper += 9000;
    buyUpgrade("exploreTheLibrary")
    buyUpgrade("readSpellPrimers")
    buyUpgradesLessThan(1400)

}

function debugStart() {
    document.getElementById("bonus50").style.display = "";
    document.getElementById("skipTime60").style.display = "";
    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        actionObj.hasBeenUnlocked = true;
    }

    //to start the game easier:
    if(!isLoadingEnabled) {
        data.currentGameState.bonusTime = 1000 * 60 * 60 * 24 * 7 * 4;
        data.currentGameState.instantTime = 1000 * 60 * 60 * 24 * 7 * 4;
        data.ancientCoin = 10;
        buyUpgrade("stopLettingOpportunityWait")
        buyUpgrade("knowWhenToMoveOn")
        setSliderUI("overclock", "reflect", 100)

        toggleNumberType()
        toggleNumberType()

    }
    data.useAmuletButtonShowing = true;
    data.doneKTL = true;
    data.doneAmulet = true;
    data.displayJob = true;
    views.updateVal(`openViewAmuletButton`, "", "style.display");

    unveilPlane(0);
    unveilPlane(1);

}

function debug1stKill() {

    // data.ancientCoin = 100000;
    //after finishing loop 0:
    //8h, 3.37e33, HATL 1, thread 4, cast 11
    //buy automation
    if(debugLevel >= 1) {
        statAddAmount("legacy", 25 + 9.97);
        data.ancientWhisper += 10;

        buyUpgrade("respectTheShrine")
        revealAction("echoKindle")
        revealAction("resonanceFurnace")
        unlockAction(data.actions.echoKindle);
        unlockAction(data.actions.resonanceFurnace)
        unlockAction(data.actions.dissipation)
        unlockAction(data.actions.poolMana)
        unlockAction(data.actions.manaExperimentation)
        unlockAction(data.actions.expelMana);
        unlockAction(data.actions.tightenAura);
        unlockAction(data.actions.collectDischargedMotes);
        unlockAction(data.actions.stretchManaCapacity);
        unlockAction(data.actions.spellResearch);
        unlockAction(data.actions.bindThePages);
        unlockAction(data.actions.awakenYourGrimoire);
        unlockAction(data.actions.etchTheCircle);
        unlockAction(data.actions.infuseTheHide);

        unlockAction(data.actions.threadArcana);
        unlockAction(data.actions.prepareSpells);
        unlockAction(data.actions.prepareInternalSpells);
        unlockAction(data.actions.overcharge);
        unlockAction(data.actions.overwork);
    }
    //after finishing loop 1:
    //9:10h, 6.59e34m, HATL 1, thread 9, cast 34, hum 1
    //OTTL: 20

    if(debugLevel >= 2) {
        data.ancientCoin += 10;
        data.ancientWhisper += 10;
        buyUpgrade("improveMyGrimoire")
        buyUpgrade("refineMyAwareness")
        statAddAmount("legacy", 125 + 43.16);
    }

    //after finishing loop 2:
    //8:00h, 1.26e35, grimoire research 2, HATL 1, cast 36, thread 11, hum 1
    //OTTL 21

    if(debugLevel >= 3) {
        data.ancientCoin += 10;
        data.ancientWhisper += 10;
        statAddAmount("legacy", 125 + 93.89);
        unlockAction(data.actions.grimoireResearch);
        buyUpgrade("feelTheEchoesOfTheBurntTown")
        buyUpgrade("refineMyObservation")

        changeAutomationCanDisable("gossipAroundCoffee", false);
    }
    //after finishing loop 3
    //7:10h, 1.5e37, GR 3, HATL 2, cast 36, thread 13, hum 2

    if(debugLevel >= 4) {
        data.ancientCoin += 30;
        data.ancientWhisper += 20;
        statAddAmount("legacy", 225 + 267.36);

        buyUpgrade("buyNicerStuff")
        buyUpgrade("refineMyConcentration")
        buyUpgrade("refineMyInfluence")
    }

    //after finishing loop 4:
    //6:00, 2.62e37, GR 3, HATL 2, cast 32, thread 13
    //OTTL 29

    if(debugLevel >= 5) {
        data.ancientCoin += 30;
        data.ancientWhisper += 20;
        statAddAmount("legacy", 225 + 287.89);

        buyUpgrade("refineMyControl")
        buyUpgrade("shapeMyMana")
    }

    //after finishing loop 5:
    //5h: 7e37, GR 3, HATL 2, cast 35, thread 14


    if(debugLevel >= 6) {
        data.ancientCoin += 30;
        data.ancientWhisper += 20;
        statAddAmount("legacy", 225 + 339.35);

        buyUpgrade("refineMyEndurance")
        unlockAction(data.actions.condenseAura)
        unlockAction(data.actions.focusInwards)
    }

    //after finishing loop 6:
    //5h: 1.17e37, GR 3, HATL 2, cast 36, thread 15

    if(debugLevel >= 7) {
        data.ancientCoin += 30;
        data.ancientWhisper += 20;
        statAddAmount("legacy", 225 + 380);

        buyUpgrade("startALittleQuicker")
        buyUpgrade("refineMyAwareness")
        buyUpgrade("feelTheEchoesOfTheBurntTown")
    }

    //6:30h, 3.5e40, GR 3, HATL 3, cast 41, thread 19, despair 1

    if(debugLevel >= 8) {
        data.ancientCoin += 45;
        data.ancientWhisper += 20;
        statAddAmount("legacy", 1725 + 729);

        buyUpgrade("chatLongerWithAllies")
        buyUpgrade("refineMyAmbition")
        buyUpgrade("refineMyMight")
        buyUpgrade("refineMyNavigation")
        buyUpgrade("refineMyImpedance")
    }

    //6h, 1.16e41, GR 3, HATL 3, cast 40, thread 20, despair 1

    if(debugLevel >= 9) {
        data.ancientCoin += 45;
        data.ancientWhisper += 20;
        statAddAmount("legacy", 1725 + 741);

        buyUpgrade("refineMyPulse")
    }

    //6h, 1.32e41, GR 3, HATL 3, cast 41, thread 21, despair 1
    //OOTL 43

    if(debugLevel >= 10) {
        data.ancientCoin += 45;
        data.ancientWhisper += 20;
        statAddAmount("legacy", 1725 + 772);

        buyUpgrade("improveMyGrimoire")
        buyUpgrade("refineMyIntegration")
    } //1e4 legacy

    //8h, 3e42, GR 5, HATL 3, cast 45, thread 25, despair 2
    //OOTL 48

    if(debugLevel >= 11) {
        data.ancientCoin += 90;
        data.ancientWhisper += 40;
        statAddAmount("legacy", 3225 + 2115);

        unlockAction(data.actions.castToFail)
        unlockAction(data.actions.locateWeakness)
        buyUpgrade("useMyGrimoiresPower")
        buyUpgrade("useMyGrimoiresPower")
        buyUpgrade("refineMyCycle")
        buyUpgrade("refineMyAmplification")

    }

    //8:50, 6.24e42, HATL 4, GR 7, cast 48, thread 27, despair 2
    //OOTL 49

    if(debugLevel >= 12) {
        data.ancientCoin += 135;
        data.ancientWhisper += 40;
        statAddAmount("legacy", 3225 + 2795);

        unlockAction(data.actions.overtalk)
        unlockAction(data.actions.overboost)
        buyUpgrade("haveBetterIceBreakers")
        buyUpgrade("shapeMyMana")
        buyUpgrade("refineMyCharm")
        buyUpgrade("refineMyLeverage")
    }

    //7:20, 9.6e42, HATL 4, GR 7, cast 50, thread 30
    //OOTL 50

    if(debugLevel >= 13) {
        data.ancientCoin += 135;
        data.ancientWhisper += 40;
        statAddAmount("legacy", 3225 + 3014);

        buyUpgrade("buyNicerStuff")

        buyUpgrade("refineMyConfidence")
        buyUpgrade("refineMyEnergy")
        buyUpgrade("refineMyConcentration")
        buyUpgrade("refineMyObservation")
    }

    //6h: 3.4e43, HATL 4, GR 7, cast 49, thread 30
    //OOTL 52


    if(debugLevel >= 14) {
        data.ancientCoin += 135;
        data.ancientWhisper += 40;
        statAddAmount("legacy", 3225 + 3100);

        buyUpgrade("investMyCoins")

        buyUpgrade("increaseInitialInvestment")
        buyUpgrade("increaseInitialInvestment")
        buyUpgrade("refineMyEndurance")
    }

    //9:20: 3.5e45, HATL 4, GR 7, cast 53, thread 32, fix 1
    //OTTL 59

    if(debugLevel >= 15) {
        data.ancientCoin += 135;
        data.ancientWhisper += 40;
        statAddAmount("legacy", 3225 + 5044);

        unlockAction(data.actions.fixTheFormula)
        buyUpgrade("refineMyControl")
        buyUpgrade("refineMyWizardry")
    }

    //6:10h: 8.36e44, HATL 4, GR 7, cast 52, thread 31, fix 1
    //OTTL 57

    if(debugLevel >= 16) {
        data.ancientCoin += 135;
        data.ancientWhisper += 40;
        statAddAmount("legacy", 3225 + 4730);

        buyUpgrade("feelTheEchoesOfTheBurntTown")
        buyUpgrade("recognizeTheFamiliarity")
        buyUpgrade("startALittleQuicker")
    }

    //2h, 6.5e38, HATL 2, GR 3, cast 34, thread 32 = 628/60/40
    //3h, 2.63e42, HATL 3, GR 7, cast 45, thread 32, feel 1 = 2434/90/40
    //6:10, 8.69e47, HATL 4, GR 7, cast 52, thread 32, fix 1
    //OTTL 67

    //7:30, 4.6e48, HATL 5, GR 7, cast 54, thread 33, fix 1 = 5604/202.5/40

    //doing a few 3h runs to unlock the rest of whispers:
    //17, 18, 19, 20, 21 = 12500 / 450 / 200

    if(debugLevel >= 31) {
        data.ancientCoin += 1350;
        data.ancientWhisper += 700;
        statAddAmount("legacy", 85875);

        buyUpgrade("buyNicerStuff") //45
        buyUpgrade("shapeMyMana") //80
        buyUpgrade("chatLongerWithAllies") //90
        buyUpgrade("investMyCoins") //100
        buyUpgrade("feelTheEchoesOfTheBurntTown") //120
        buyUpgrade("useMoreComplexSpells") //100
        buyUpgrade("improveMyGrimoire")  //160


        buyUpgrade("startALittleQuicker")
        buyUpgrade("increaseInitialInvestment")
        buyUpgrade("increaseInitialInvestment")

        buyUpgrade("refineMyAmbition")
        buyUpgrade("refineMyMight")
        buyUpgrade("refineMyImpedance")
        buyUpgrade("refineMyNavigation")
        buyUpgrade("refineMySavvy")
        buyUpgrade("refineMyInfluence")
        buyUpgrade("refineMyValor")
        buyUpgrade("refineMyAwareness")
        buyUpgrade("refineMyConfidence")
        buyUpgrade("refineMyEnergy")
        buyUpgrade("refineMyPulse")
        buyUpgrade("refineMyVision")
        buyUpgrade("refineMyAmplification")
        buyUpgrade("refineMyLeverage")

        buyUpgrade("channelMore")
    }



    if(debugLevel >= 32) {
        unlockAction(data.actions.boldenLines)
        unlockAction(data.actions.overproduce)
        unlockAction(data.actions.overhear)
        unlockAction(data.actions.modifyAuraDensity)
        unlockAction(data.actions.createAVoid);
        unlockAction(data.actions.grindPigments);
    }

    //2h: 1e42, HATL 3, 24 MQ, cast 46, thread 27 = 2837/90/40
    //3:50h, 7.08e46, HATL 4, 60 MQ, cast 58, thread 32 = 6527/236.25/150
    //6h: 7.6e50, HATL 5, 66 MQ, cast 66, thread 35 = 9418/354.38/150
    //9h: 4e56, HATL 6, 156 MQ, cast 76, thread 40 = 20k+18500/531.56/150
    //11h: 6e58, HATL 7, 210 MQ, cast 83, thread 43 = 40k + 26k/797.34/150


    //10:10h: 5.7e56, HATL 6, 210 MQ, cast 90, thread 42, repair 1
    if(debugLevel >= 33) {
        statAddAmount("legacy", 3.3e4 + 3e4);
        data.ancientCoin += 531.56;
        data.ancientWhisper += 110;

        buyUpgrade("startALittleQuicker")
        buyUpgrade("startALittleQuicker")
        buyUpgrade("increaseInitialInvestment")
        buyUpgrade("channelMore")
    }

    //9:10h: 6.7e56, HATL 6, 210 MQ, cast 90, thread 43, repair 1

    if(debugLevel >= 34) {
        statAddAmount("legacy", 3.3e4 + 3e4);
        data.ancientCoin += 531.56;
        data.ancientWhisper += 120;

        buyUpgrade("haveBetterIceBreakers")
        buyUpgrade("refineMyCharm")
        buyUpgrade("refineMyConcentration")
    }

    //9h: 1.07e58, HATL 7, 270 MQ, cast 95, thread 44, repair 1

    if(debugLevel >= 35) {
        statAddAmount("legacy", 3.3e4 + 3.8e4);
        data.ancientCoin += 797.56;
        data.ancientWhisper += 120;

        buyUpgrade("glimpseTheWeave")
        buyUpgrade("increaseMyPace")
    }

    //11h: 6.6e59, HATL 7, 336 MQ, cast 104, thread 47, repair 2

    if(debugLevel >= 35) {
        statAddAmount("legacy", 6.3e4 + 5.59e4);
        data.ancientCoin += 797.56;
        data.ancientWhisper += 120;

        buyUpgrade("extractMyWorth")
        buyUpgrade("listenToThePast")
        buyUpgrade("refineMyObservation")
        buyUpgrade("refineMyCycle")
        buyUpgrade("refineMyArchmagery")
        buyUpgrade("refineMyImpedance")
    }

    //10h: 8.64e59, HATL 7, 336 MQ, cast 105, thread 49, repair 2

    if(debugLevel >= 36) {
        statAddAmount("legacy", 6.3e4 + 5.59e4);
        data.ancientCoin += 797.56;
        data.ancientWhisper += 120;

        buyUpgrade("refineMyControl")
        buyUpgrade("refineMyResonance")
        buyUpgrade("refineMySpellcraft")
    }

    //10h: 1e61, HATL 8, 408 MQ, cast 109, thread 51

    if(debugLevel >= 37) {
        statAddAmount("legacy", 6.3e4 + 6.7e4);
        data.ancientCoin += 1196;
        data.ancientWhisper += 120;

        buyUpgrade("refineMyWizardry")
        buyUpgrade("refineMyAmbition")
        buyUpgrade("refineMyEndurance")
        buyUpgrade("refineMyMight")
        buyUpgrade("refineMySavvy")
        buyUpgrade("refineMyInfluence")
        buyUpgrade("refineMyIntegration")
        buyUpgrade("refineMyLeverage")
        buyUpgrade("refineMyAwareness")
    }

    //8h: 3e61, HATL 8, 408 MQ, cast 110, thread 51


    if(debugLevel >= 38) {
        statAddAmount("legacy", 6.3e4 + 7.15e4);
        data.ancientCoin += 1196;
        data.ancientWhisper += 120;

        buyUpgrade("refineMyConfidence")
        buyUpgrade("refineMyCharm")
        buyUpgrade("refineMyObservation")
        buyUpgrade("refineMyEndurance")
        buyUpgrade("refineMyNavigation")
    }

    //7h: 5e60, HATL 8, 408 MQ, cast 109, thread 51


    if(debugLevel >= 39) {
        statAddAmount("legacy", 6.3e4 + 6.7e4);
        data.ancientCoin += 1196;
        data.ancientWhisper += 120;

        buyUpgrade("refineMyAmplification")
        buyUpgrade("refineMyValor")
        buyUpgrade("refineMyEnergy")
        buyUpgrade("refineMyVision")
    }

    //then 2h runs for the 120 AW until I have it all

    if(debugLevel >= 40) {
        statAddAmount("legacy", 12000);
        data.ancientCoin += 4000;
        data.ancientWhisper += 1200;


        buyUpgrade("shapeMyMana") //160
        buyUpgrade("useMoreComplexSpells") //200
        buyUpgrade("investMyCoins") //200
        buyUpgrade("feelTheEchoesOfTheBurntTown") //240
        buyUpgrade("chatLongerWithAllies") //270
        buyUpgrade("shapeMyMana") //320

        buyUpgrade("increaseInitialInvestment")
        buyUpgrade("increaseInitialInvestment")
        buyUpgrade("learnToFocusMore")
        buyUpgrade("learnToFocusMore")
        buyUpgrade("temperMyDesires")
        buyUpgrade("channelMore")
        buyUpgrade("listenToThePast")
        buyUpgrade("increaseMarketCap")
        buyUpgrade("increaseMarketCap")

        changeAutomationOnReveal("spendFortune", 50)
    }

    if(debugLevel >= 41) {
        unlockAction(data.actions.hearThePulse);
        unlockAction(data.actions.findTheThread);
        unlockAction(data.actions.layerAura);
        unlockAction(data.actions.condenseMana);
        unlockAction(data.actions.chargeInk);
        unlockAction(data.actions.overponder);

    }

    if(debugLevel >= 45) {
        statAddAmount("legacy", 1e6);
        data.ancientCoin += 12500;
        data.ancientWhisper += 1200;


        buyUpgrade("refineMyImpedance")
        buyUpgrade("refineMyImpedance")
        buyUpgrade("refineMyAmbition")
        buyUpgrade("refineMyMight")
        buyUpgrade("refineMyNavigation")
        buyUpgrade("refineMyPulse")
        buyUpgrade("refineMySavvy")
        buyUpgrade("refineMyConcentration")
        buyUpgrade("refineMyInfluence")
        buyUpgrade("refineMyIntegration")
        buyUpgrade("refineMyWizardry")
        buyUpgrade("refineMyArchmagery")
        buyUpgrade("refineMyCycle")
        buyUpgrade("refineMyAmplification")
        buyUpgrade("refineMySpellcraft")
        buyUpgrade("refineMyValor")
        buyUpgrade("refineMyLeverage")

        buyUpgrade("investMyCoins")
        buyUpgrade("feelTheEchoesOfTheBurntTown")
        buyUpgrade("shapeMyMana")
        buyUpgrade("rememberWhatIFocusedOn")
        buyUpgrade("rememberWhatIFocusedOn")
        buyUpgrade("rememberWhatIFocusedOn")
        buyUpgrade("increaseMarketCap")
        buyUpgrade("glimpseTheWeave")
        buyUpgrade("extractMyWorth")
        buyUpgrade("increaseMyPace")
        buyUpgrade("haveBetterIceBreakers")
    }

    if(debugLevel >= 46) {
        statAddAmount("legacy", 3e5);

        unlockAction(data.actions.isolateRhythms)
        unlockAction(data.actions.spinMana)
        unlockAction(data.actions.matchTempo)
    }

}

function debug2ndKill() {

    if(debugLevel >= 50) {
        statAddAmount("legacy", 1e6);
        increaseLichKills();
        legacySeveranceReset(true)

    }

    //6h, 3.7e33, HATL 1, 1 MQ, shrine 1, thread 7, cast 17

    if(debugLevel >= 51) {
        data.legacy += 75;
        data.actions.reposeRebounded.exp += 365
        data.actions.turnTheWheel.exp += 365 //level 8

        data.legacy += 35;
        data.ancientCoin += 10;
        data.ancientWhisper += 15;


        buyUpgrade("respectTheShrine")
        buyUpgrade("improveMyGrimoire")

        buyUpgrade("rememberWhatIDid")

        unveilPlane(1);
        revealAction("echoKindle")
        revealAction("resonanceFurnace")
        unlockAction(data.actions.echoKindle);
        unlockAction(data.actions.resonanceFurnace)
        unlockAction(data.actions.dissipation)
        unlockAction(data.actions.poolMana)
        unlockAction(data.actions.manaExperimentation)
        unlockAction(data.actions.expelMana);
        unlockAction(data.actions.tightenAura);
        unlockAction(data.actions.collectDischargedMotes);
        unlockAction(data.actions.stretchManaCapacity);
        unlockAction(data.actions.spellResearch);
        unlockAction(data.actions.bindThePages);
        unlockAction(data.actions.awakenYourGrimoire);
        unlockAction(data.actions.etchTheCircle);
        unlockAction(data.actions.infuseTheHide);

        unlockAction(data.actions.threadArcana);
        unlockAction(data.actions.prepareSpells);
        unlockAction(data.actions.prepareInternalSpells);
        unlockAction(data.actions.overcharge);
        unlockAction(data.actions.overwork);
    }

    //6h, 1.5e34, HATL 1, shrine 1, 3 MQ, thread 11, cast 28

    if(debugLevel >= 52) {
        data.legacy += 75;
        data.actions.reposeRebounded.exp += 365
        data.actions.turnTheWheel.exp += 365

        data.legacy += 143.11;
        data.ancientCoin += 10;
        data.ancientWhisper += 15;

        buyUpgrade("feelTheEchoesOfTheBurntTown")

        buyUpgrade("refineMyAwareness")

        unlockAction(data.actions.grimoireResearch);
    }

    //6:20h, 4.02e35, HATL 2, hum 1, 4 MQ, thread 14, cast 31

    if(debugLevel >= 53) {
        data.legacy += 375;
        data.actions.reposeRebounded.exp += 385
        data.actions.turnTheWheel.exp += 385

        data.legacy += 366;
        data.ancientCoin += 30;
        data.ancientWhisper += 30;

        buyUpgrade("shapeMyMana")

        buyUpgrade("pickUpValuablePlants")

        unlockAction(data.actions.dipInTheRiver);
    }

    //6h, 3.87e36, HATL 2, 4 MQ, thread 17, cast 33, hum 2

    if(debugLevel >= 54) {
        data.legacy += 675;
        data.actions.reposeRebounded.exp += 365
        data.actions.turnTheWheel.exp += 365

        data.legacy += 597;
        data.ancientCoin += 30;
        data.ancientWhisper += 30;

        buyUpgrade("buyNicerStuff")

        buyUpgrade("refineMyEndurance")
        buyUpgrade("refineMyObservation")
        buyUpgrade("refineMyAmbition")

        unlockAction(data.actions.condenseAura)
        unlockAction(data.actions.focusInwards)
        unlockAction(data.actions.prepareInfusion);
    }

    //6h, 1.7e38, HATL 2, 4 MQ, thread 19, cast 34

    if(debugLevel >= 55) {
        data.legacy += 675;
        data.actions.reposeRebounded.exp += 365
        data.actions.turnTheWheel.exp += 365

        data.legacy += 957;
        data.ancientCoin += 30;
        data.ancientWhisper += 30;

        buyUpgrade("feelTheEchoesOfTheBurntTown")

        buyUpgrade("refineMyConcentration")
        buyUpgrade("valueMyBody")

    }

    //7h, 3.34e40, HATL 3, 4 MQ, thread 23, cast 38, despair 1

    if(debugLevel >= 56) {
        data.legacy += 5175;
        data.actions.reposeRebounded.exp += 425
        data.actions.turnTheWheel.exp += 425

        data.legacy += 1444;
        data.ancientCoin += 90;
        data.ancientWhisper += 60;

        buyUpgrade("improveMyGrimoire")
        buyUpgrade("useMyGrimoiresPower")
        buyUpgrade("buyNicerStuff")

        buyUpgrade("refineMyImpedance")
        buyUpgrade("refineMyControl")
        buyUpgrade("refineMyInfluence")
        buyUpgrade("refineMyAwareness")
        buyUpgrade("refineMyMight")

    }

    //6h, 4.38e41, HATL 3, 14 MQ, thread 25, cast 40, despair 1

    if(debugLevel >= 57) {
        data.legacy += 5175;
        data.actions.reposeRebounded.exp += 365
        data.actions.turnTheWheel.exp += 365

        data.legacy += 3474;
        data.ancientCoin += 90;
        data.ancientWhisper += 60;

        buyUpgrade("useMyGrimoiresPower")
        buyUpgrade("shapeMyMana")

        buyUpgrade("refineMyCharm")
        buyUpgrade("refineMyNavigation")
        buyUpgrade("refineMyAmplification")
        buyUpgrade("refineMyConfidence")

        unlockAction(data.actions.infuseBody)
        unlockAction(data.actions.castToFail)
        unlockAction(data.actions.locateWeakness)
        unlockAction(data.actions.overtalk)
    }

    //7h, 6.83e42, HATL 4, 16 MQ, thread 31, cast 48, despair 2

    if(debugLevel >= 58) {
        data.legacy += 9675;
        data.actions.reposeRebounded.exp += 425
        data.actions.turnTheWheel.exp += 425

        data.legacy += 4796;
        data.ancientCoin += 135;
        data.ancientWhisper += 60;

        buyUpgrade("feelTheEchoesOfTheBurntTown")

        buyUpgrade("refineMyEnergy")
        buyUpgrade("refineMyCycle")
        buyUpgrade("refineMyPulse")

        unlockAction(data.actions.overboost)

        unlockAction(data.actions.infuseMind)
        unlockAction(data.actions.widenChannels)
        unlockAction(data.actions.solidifyEdges)
    }

    //6:0h, 2.99e43, HATL 4, 32 MQ, thread 32, cast 48

    if(debugLevel >= 59) {
        data.legacy += 9675;
        data.actions.reposeRebounded.exp += 365
        data.actions.turnTheWheel.exp += 365

        data.legacy += 6664
        data.ancientCoin += 135
        data.ancientWhisper += 60;

        buyUpgrade("chatLongerWithAllies")

        buyUpgrade("refineMyIntegration")
        buyUpgrade("refineMyConcentration")
        buyUpgrade("refineMySavvy")
    }

    //6h, 6.5e46, HATL 4, 32 MQ, thread 34, cast 50

    if(debugLevel >= 60) {
        data.legacy += 9675;
        data.actions.reposeRebounded.exp += 365
        data.actions.turnTheWheel.exp += 365

        data.legacy += 8566
        data.ancientCoin += 135
        data.ancientWhisper += 60;

        buyUpgrade("buyNicerStuff")

        buyUpgrade("refineMyAmbition")
        buyUpgrade("haveBetterIceBreakers")
    }

    //6h, 3.12e47, HATL 5, 32 MQ, thread 35, cast 50

    if(debugLevel >= 61) {
        data.legacy += 9675;
        data.actions.reposeRebounded.exp += 365
        data.actions.turnTheWheel.exp += 365

        data.legacy += 8772
        data.ancientCoin += 202.5
        data.ancientWhisper += 60;

        buyUpgrade("investMyCoins")

        buyUpgrade("refineMyLeverage")
        buyUpgrade("refineMyObservation")
        buyUpgrade("refineMyImpedance")
        buyUpgrade("refineMyControl")
        buyUpgrade("refineMyWizardry")

        unlockAction(data.actions.infuseImage)
    }

    //6h, 2.03e50, HATL 5, 48 MQ, thread 36, cast 53

    if(debugLevel >= 62) {
        data.legacy += 9675;
        data.actions.reposeRebounded.exp += 365
        data.actions.turnTheWheel.exp += 365

        data.legacy += 1.02e4
        data.ancientCoin += 354.38
        data.ancientWhisper += 180;

        buyUpgrade("shapeMyMana")
        buyUpgrade("investMyCoins")

        buyUpgrade("refineMyEndurance")
        buyUpgrade("refineMyMight")
        buyUpgrade("refineMyNavigation")
        buyUpgrade("refineMyInfluence")
        buyUpgrade("refineMyAwareness")
        buyUpgrade("refineMyVision")
    }

    //6h, 3.01e51, HATL 6, 48 MQ, thread 39, cast 62

    if(debugLevel >= 63) {
        data.legacy += 9675;
        data.actions.reposeRebounded.exp += 365
        data.actions.turnTheWheel.exp += 365

        data.legacy += 1.27e4
        data.ancientCoin += 531
        data.ancientWhisper += 180;

        buyUpgrade("feelTheEchoesOfTheBurntTown")
        buyUpgrade("chatLongerWithAllies")

        buyUpgrade("refineMyEnergy")
        buyUpgrade("refineMyIntegration")
        buyUpgrade("refineMyCycle")
        buyUpgrade("refineMyCharm")

        unlockAction(data.actions.modifyAuraDensity)
        unlockAction(data.actions.createAVoid)
    }

    //6:10h, 1.52e56, HATL 7, 80 MQ, thread 43, cast 68, repair 1

    if(debugLevel >= 64) {
        data.legacy += 99675;
        data.actions.reposeRebounded.exp += 365
        data.actions.turnTheWheel.exp += 365

        data.legacy += 1.81e4
        data.ancientCoin += 797.34
        data.ancientWhisper += 180

        buyUpgrade("investMyCoins")

        buyUpgrade("pickUpValuablePlants")
        buyUpgrade("pickUpValuablePlants")
        buyUpgrade("refineMyAmplification")
        buyUpgrade("refineMyLeverage")
        buyUpgrade("refineMyValor")
        buyUpgrade("refineMyAmbition")
        buyUpgrade("refineMyConfidence")
        buyUpgrade("refineMyObservation")
        buyUpgrade("refineMyEndurance")
        buyUpgrade("refineMyConcentration")
    }

    //6h, 5.19e57, HATL 7, 96 MQ, thread 46, cast 72, repair 1

    if(debugLevel >= 65) {
        data.legacy += 99675;
        data.actions.reposeRebounded.exp += 365
        data.actions.turnTheWheel.exp += 365

        data.legacy += 2.13e4
        data.ancientCoin += 797.34
        data.ancientWhisper += 180

        buyUpgrade("improveMyGrimoire")

        buyUpgrade("refineMyMight")
        buyUpgrade("refineMyImpedance")
        buyUpgrade("refineMyPulse")
        buyUpgrade("refineMyWizardry")
        buyUpgrade("refineMyArchmagery")
        buyUpgrade("refineMySpellcraft")

        unlockAction(data.actions.boldenLines)
    }

    //6h, 2.85e58, HATL 7, 312 MQ, thread 49, cast 90, repair 1

    if(debugLevel >= 66) {
        data.legacy += 99675;
        data.actions.reposeRebounded.exp += 365
        data.actions.turnTheWheel.exp += 365

        data.legacy += 3.99e4
        data.ancientCoin += 797.34
        data.ancientWhisper += 180

        buyUpgrade("useMoreComplexSpells")

        buyUpgrade("refineMySavvy")
        buyUpgrade("refineMyControl")
        buyUpgrade("refineMyResonance")
        buyUpgrade("refineMyInfluence")
        buyUpgrade("refineMyNavigation")

        unlockAction(data.actions.infuseSenses)
    }

    //6h, 1.84e60, HATL 8, 486 MQ, thread 53, cast 111, repair 2

    if(debugLevel >= 67) {
        data.legacy += 189675;
        data.actions.reposeRebounded.exp += 365
        data.actions.turnTheWheel.exp += 365

        data.legacy += 6.88e4
        data.ancientCoin += 1196
        data.ancientWhisper += 180

        buyUpgrade("feelTheEchoesOfTheBurntTown")

        buyUpgrade("increaseMyPace")
        buyUpgrade("channelMore")
        buyUpgrade("extractMyWorth")

        buyUpgrade("refineMyAwareness")
    }


    if(debugLevel >= 80) {
        data.legacy = 3e6;
        data.actions.reposeRebounded.exp += 6000
        data.actions.turnTheWheel.exp += 6000
        data.ancientCoin += 68000
        data.ancientWhisper += 6000

        buyUpgrade("chatLongerWithAllies")
        buyUpgrade("shapeMyMana")
        buyUpgrade("shapeMyMana")
        buyUpgrade("shapeMyMana")
        buyUpgrade("shapeMyMana")
        buyUpgrade("useMoreComplexSpells")
        buyUpgrade("investMyCoins")
        buyUpgrade("feelTheEchoesOfTheBurntTown")

        buyUpgrade("pickUpValuablePlants")
        buyUpgrade("pickUpValuablePlants")
        buyUpgrade("findAngelInvestors")
        buyUpgrade("findAngelInvestors")
        buyUpgrade("valueMyBody")
        buyUpgrade("valueMyBody")


        buyUpgrade("haveBetterIceBreakers")
        buyUpgrade("haveBetterIceBreakers")
        buyUpgrade("haveBetterIceBreakers")
        buyUpgrade("glimpseTheWeave")
        buyUpgrade("glimpseTheWeave")
        buyUpgrade("glimpseTheWeave")
        buyUpgrade("listenToThePast")
        buyUpgrade("listenToThePast")
        buyUpgrade("listenToThePast")
        buyUpgrade("increaseMarketCap")
        buyUpgrade("increaseMarketCap")
        buyUpgrade("increaseMarketCap")
        buyUpgrade("increaseMarketCap")
        buyUpgrade("increaseMarketCap")
        buyUpgrade("extractMyWorth")
        buyUpgrade("extractMyWorth")
        buyUpgrade("increaseMyPace")
        buyUpgrade("increaseMyPace")
        buyUpgrade("channelMore")
        buyUpgrade("channelMore")


        buyUpgrade("refineMyAmplification")
        buyUpgrade("refineMyAmplification")
        buyUpgrade("refineMyLeverage")
        buyUpgrade("refineMyLeverage")
        buyUpgrade("refineMyValor")
        buyUpgrade("refineMyValor")
        buyUpgrade("refineMyAmbition")
        buyUpgrade("refineMyAmbition")
        buyUpgrade("refineMyConfidence")
        buyUpgrade("refineMyConfidence")
        buyUpgrade("refineMyCharm")
        buyUpgrade("refineMyCharm")
        buyUpgrade("refineMyObservation")
        buyUpgrade("refineMyObservation")
        buyUpgrade("refineMyEndurance")
        buyUpgrade("refineMyEndurance")
        buyUpgrade("refineMyMight")
        buyUpgrade("refineMyMight")
        buyUpgrade("refineMyNavigation")
        buyUpgrade("refineMyNavigation")
        buyUpgrade("refineMyImpedance")
        buyUpgrade("refineMyImpedance")
        buyUpgrade("refineMyEnergy")
        buyUpgrade("refineMyEnergy")
        buyUpgrade("refineMyVision")
        buyUpgrade("refineMyVision")
        buyUpgrade("refineMyPulse")
        buyUpgrade("refineMyPulse")
        buyUpgrade("refineMySavvy")
        buyUpgrade("refineMySavvy")
        buyUpgrade("refineMyConcentration")
        buyUpgrade("refineMyConcentration")
        buyUpgrade("refineMyInfluence")
        buyUpgrade("refineMyInfluence")
        buyUpgrade("refineMyIntegration")
        buyUpgrade("refineMyIntegration")
        buyUpgrade("refineMyWizardry")
        buyUpgrade("refineMyWizardry")
        buyUpgrade("refineMyArchmagery")
        buyUpgrade("refineMyArchmagery")
        buyUpgrade("refineMyCycle")
        buyUpgrade("refineMyCycle")
        buyUpgrade("refineMySpellcraft")
        buyUpgrade("refineMySpellcraft")
        buyUpgrade("refineMyResonance")
        buyUpgrade("refineMyResonance")
        buyUpgrade("refineMyControl")
        buyUpgrade("refineMyAwareness")

        unlockAction(data.actions.infuseMagic)

        unlockAction(data.actions.layerAura)
        unlockAction(data.actions.condenseMana)
        unlockAction(data.actions.hearThePulse);
        unlockAction(data.actions.findTheThread);
        unlockAction(data.actions.grindPigments);
        unlockAction(data.actions.isolateRhythms);
        unlockAction(data.actions.matchTempo);
        unlockAction(data.actions.chargeInk);
        unlockAction(data.actions.overponder);
        unlockAction(data.actions.overhear);
        unlockAction(data.actions.overproduce);
    }

    //12h, 6.7e68, 2646 MQ, HATL 10 = kill
}


function debugAfterCare() {
    //debug cleanup, things that happen on amulet use or otherwise

    data.actions.echoKindle.resource = data.legacy;

    for(let i = 0; i < 20; i++) {
        checkLevelUp(data.actions.turnTheWheel, actionData.turnTheWheel)
        checkLevelUp(data.actions.reposeRebounded, actionData.reposeRebounded)
    }

    //apply debug bonus stats
    for (let attVar in data.atts) {
        let attObj = data.atts[attVar];
        if(attVar !== "flow") {
            attsSetBaseVariables(attObj);
        }
        statAddAmount(attVar, 0);
        if(data.atts[attVar].attBase !== 0) { //if it has a bonus applied
            revealAtt(attVar);
        }
    }

    for (let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        let dataObj = actionData[actionVar];
        if(dataObj.plane !== 1 && dataObj.plane !== 3) {
            actionObj.unlockedCount = debugLevel
        }
        if(!actionObj.unlocked) {
            actionObj.unlockCost = (1 - (actionObj.unlockedCount * .04) / (1 + actionObj.unlockedCount * .04)) * dataObj.unlockCost;
        }
        actionObj.unlockCost *= data.lichKills >= 1 ? 2 * data.lichKills : 1;
        views.updateVal(`${actionVar}UnlockText`, generateUnlockText(actionVar), "innerHTML");

        if(actionVar !== "reposeRebounded" && actionVar !== "turnTheWheel" && actionVar !== "tidalBurden") {
            actionObj.highestLevel = 2000;
            actionObj.secondHighestLevel = 2000;
        }
    }

    for (let actionVar in data.actions) {
        const actionObj = data.actions[actionVar];
        const dataObj = actionData[actionVar];
        if(dataObj.plane === 1) {
            continue;
        }

        for (let downstreamVar of dataObj.downstreamVars) {
            actionObj[`${downstreamVar}PermFocusMult`] = 4;
        }
    }

    for (let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        let dataObj = actionData[actionVar];
        if(dataObj.plane === 1 && actionObj.purchased) {
            unlockAction(actionObj)
        }
    }

    adjustBrythalMaxLevels()
    adjustMagicMaxLevels()

    if(globalVisible) {
        unveilPlane(0);
        unveilPlane(1);
        unveilPlane(2);
        unveilPlane(3);
    }
}