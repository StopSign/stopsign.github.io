/**
 * Shrine prestige card definitions and owned-count helpers.
 * Drawing / prestige grant flow is wired elsewhere; effects apply from owned counts.
 */

var SHRINE_CARD_RARITY_ORDER = ["common", "rare", "epic"];

var SHRINE_CARD_DEFINITION_ROWS = [
    {
        key: "manaRegen",
        name: "Mana Regen",
        class: "none",
        category: "buff",
        rarity: { common: -1, rare: 5, epic: 1 },
        getEffect: function(rarity) {
            if (rarity === "common") return { manaRegenAdd: 0.10 };
            if (rarity === "rare") return { manaRegenAdd: 0.30 };
            if (rarity === "epic") return { manaRegenAdd: 1.00 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Mana Regen: +" + Math.round((e.manaRegenAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Mana Regen: +" + Math.round((totalEffect.manaRegenAdd || 0) * 100) + "%";
        }
    },
    {
        key: "manaCapacity",
        name: "Mana Capacity",
        class: "none",
        category: "buff",
        rarity: { rare: 3, epic: 1 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { manaCapacityAdd: 0.20 };
            if (rarity === "epic") return { manaCapacityAdd: 0.50 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Mana Capacity: +" + Math.round((e.manaCapacityAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Mana Capacity: +" + Math.round((totalEffect.manaCapacityAdd || 0) * 100) + "%";
        }
    },
    {
        key: "okamiExpBonus",
        name: "Okami Exp Bonus",
        class: "none",
        category: "buff",
        rarity: { common: -1, rare: 3, epic: 1 },
        getEffect: function(rarity) {
            if (rarity === "common") return { okamiExpAdd: 0.10 };
            if (rarity === "rare") return { okamiExpAdd: 0.40 };
            if (rarity === "epic") return { okamiExpAdd: 1.00 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Okami Exp: +" + Math.round((e.okamiExpAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Okami Exp: +" + Math.round((totalEffect.okamiExpAdd || 0) * 100) + "%";
        }
    },
    {
        key: "skillExpBonus",
        name: "Skill Exp Bonus",
        class: "none",
        category: "buff",
        rarity: { common: -1, rare: 3, epic: 1 },
        getEffect: function(rarity) {
            if (rarity === "common") return { skillExpAdd: 0.05 };
            if (rarity === "rare") return { skillExpAdd: 0.10 };
            if (rarity === "epic") return { skillExpAdd: 0.40 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Skill Exp: +" + Math.round((e.skillExpAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Skill Exp: +" + Math.round((totalEffect.skillExpAdd || 0) * 100) + "%";
        }
    },
    {
        key: "talentExpBonus",
        name: "Talent Exp Bonus",
        class: "none",
        category: "buff",
        rarity: { common: -1, rare: 3, epic: 1 },
        getEffect: function(rarity) {
            if (rarity === "common") return { talentExpAdd: 0.05 };
            if (rarity === "rare") return { talentExpAdd: 0.10 };
            if (rarity === "epic") return { talentExpAdd: 0.40 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Talent Exp: +" + Math.round((e.talentExpAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Talent Exp: +" + Math.round((totalEffect.talentExpAdd || 0) * 100) + "%";
        }
    },
    {
        key: "manaPerDeadClone",
        name: "More Base Mana Per Dead Clone",
        class: "none",
        category: "buff",
        rarity: { rare: 3, epic: 1 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { manaPerDeadCloneAdd: 0.20 };
            if (rarity === "epic") return { manaPerDeadCloneAdd: 0.50 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Base Mana Per Dead Clone: +" + Math.round((e.manaPerDeadCloneAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Base Mana Per Dead Clone: +" + Math.round((totalEffect.manaPerDeadCloneAdd || 0) * 100) + "%";
        }
    },
    {
        key: "baseAudacity",
        name: "Base Audacity",
        class: "none",
        category: "buff",
        rarity: { common: -1, rare: 5, epic: 1 },
        getEffect: function(rarity) {
            if (rarity === "common") return { baseAudFlat: 1 };
            if (rarity === "rare") return { baseAudFlat: 3 };
            if (rarity === "epic") return { baseAudFlat: 10 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Base Audacity: +" + (e.baseAudFlat || 0);
        },
        totalBonusText: function(totalEffect) {
            return "Base Audacity: +" + (totalEffect.baseAudFlat || 0);
        }
    },
    {
        key: "baseEgoDamage",
        name: "Base Ego Damage",
        class: "none",
        category: "buff",
        rarity: { common: -1, rare: 5, epic: 1 },
        getEffect: function(rarity) {
            if (rarity === "common") return { baseSlapFlat: 0.25 };
            if (rarity === "rare") return { baseSlapFlat: 1 };
            if (rarity === "epic") return { baseSlapFlat: 3 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            const v = e.baseSlapFlat || 0;
            const s = (Math.abs(v - Math.round(v)) < 1e-9) ? String(Math.round(v)) : String(v);
            return "Base Ego Damage: +" + s;
        },
        totalBonusText: function(totalEffect) {
            const v = totalEffect.baseSlapFlat || 0;
            const s = (Math.abs(v - Math.round(v)) < 1e-9) ? String(Math.round(v)) : String(roundNearestDecimals(v, 2));
            return "Base Ego Damage: +" + s;
        }
    },
    {
        key: "okamiSpiritStrands",
        name: "Okami Spirit Strands Bonus",
        class: "none",
        category: "buff",
        rarity: { common: -1, rare: 3, epic: 1 },
        getEffect: function(rarity) {
            if (rarity === "common") return { spiritStrandsAdd: 0.10 };
            if (rarity === "rare") return { spiritStrandsAdd: 0.30 };
            if (rarity === "epic") return { spiritStrandsAdd: 1.00 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Okami Spirit Strands: +" + Math.round((e.spiritStrandsAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Okami Spirit Strands: +" + Math.round((totalEffect.spiritStrandsAdd || 0) * 100) + "%";
        }
    },
    {
        key: "chopPower",
        name: "Chop Power",
        class: "none",
        category: "buff",
        rarity: { common: -1, rare: 3, epic: 1 },
        getEffect: function(rarity) {
            if (rarity === "common") return { chopPowerAdd: 0.10 };
            if (rarity === "rare") return { chopPowerAdd: 0.30 };
            if (rarity === "epic") return { chopPowerAdd: 1.00 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Chop Power: +" + Math.round((e.chopPowerAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Chop Power: +" + Math.round((totalEffect.chopPowerAdd || 0) * 100) + "%";
        }
    },
    {
        key: "bambooBaseChips",
        name: "Bamboo Base Chips",
        class: "none",
        category: "buff",
        rarity: { common: -1, rare: 3, epic: 1 },
        getEffect: function(rarity) {
            if (rarity === "common") return { bambooBaseChipsFlat: 2 };
            if (rarity === "rare") return { bambooBaseChipsFlat: 10 };
            if (rarity === "epic") return { bambooBaseChipsFlat: 30 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Bamboo Base Chips: +" + (e.bambooBaseChipsFlat || 0);
        },
        totalBonusText: function(totalEffect) {
            return "Bamboo Base Chips: +" + (totalEffect.bambooBaseChipsFlat || 0);
        }
    },
    {
        key: "orbExp",
        name: "Orb Exp",
        class: "none",
        category: "buff",
        rarity: { common: -1, rare: 3, epic: 1 },
        getEffect: function(rarity) {
            if (rarity === "common") return { orbExpAdd: 0.10 };
            if (rarity === "rare") return { orbExpAdd: 0.30 };
            if (rarity === "epic") return { orbExpAdd: 1.00 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Orb Exp: +" + Math.round((e.orbExpAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Orb Exp: +" + Math.round((totalEffect.orbExpAdd || 0) * 100) + "%";
        }
    },
    {
        key: "reducedCloneCost",
        name: "Reduced Base Clone Cost",
        class: "none",
        category: "buff",
        rarity: { common: 10, rare: 3, epic: 1 },
        getEffect: function(rarity) {
            if (rarity === "common") return { cloneBaseCostReduction: 25 };
            if (rarity === "rare") return { cloneBaseCostReduction: 100 };
            if (rarity === "epic") return { cloneBaseCostReduction: 500 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Initial Clone Mana Cost: -" + (e.cloneBaseCostReduction || 0) + " (total cost minimum 0)";
        },
        totalBonusText: function(totalEffect) {
            return "Initial Clone Mana Cost: -" + (totalEffect.cloneBaseCostReduction || 0) + " (total cost minimum 0)";
        }
    },
    {
        key: "researchSpeed",
        name: "Increased Research Speed",
        class: "none",
        category: "buff",
        rarity: { common: -1, rare: 3, epic: 1 },
        getEffect: function(rarity) {
            if (rarity === "common") return { researchSpeedAdd: 0.10 };
            if (rarity === "rare") return { researchSpeedAdd: 0.30 };
            if (rarity === "epic") return { researchSpeedAdd: 1.00 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Research Speed: +" + Math.round((e.researchSpeedAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Research Speed: +" + Math.round((totalEffect.researchSpeedAdd || 0) * 100) + "%";
        }
    },
    {
        key: "toriiManaCapacity",
        name: "Zenko Torii Gate Mana Capacity",
        class: "none",
        category: "buff",
        rarity: { rare: 4 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { toriiManaCapacityAdd: 0.50 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Torii Gate Mana Capacity: +" + Math.round((e.toriiManaCapacityAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Torii Gate Mana Capacity: +" + Math.round((totalEffect.toriiManaCapacityAdd || 0) * 100) + "%";
        }
    },
    {
        key: "stonePileManaCapacity",
        name: "Stone Pile Mana Capacity",
        class: "none",
        category: "buff",
        rarity: { rare: 4 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { stonePileManaCapacityAdd: 0.50 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Stone Pile Mana Capacity: +" + Math.round((e.stonePileManaCapacityAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Stone Pile Mana Capacity: +" + Math.round((totalEffect.stonePileManaCapacityAdd || 0) * 100) + "%";
        }
    },
    {
        key: "innManaCapacity",
        name: "Tatami Inn Mana Capacity",
        class: "none",
        category: "buff",
        rarity: { rare: 4 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { innManaCapacityAdd: 0.50 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Tatami Inn Mana Capacity: +" + Math.round((e.innManaCapacityAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Tatami Inn Mana Capacity: +" + Math.round((totalEffect.innManaCapacityAdd || 0) * 100) + "%";
        }
    },
    {
        key: "hiddenSpringManaCostReduction",
        name: "Hidden Spring Mana Cost Reduction",
        class: "none",
        category: "buff",
        rarity: { rare: 4 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { hiddenSpringManaCostReductionAdd: 0.20 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Hidden Spring Training Mana Cost: -" + Math.round((e.hiddenSpringManaCostReductionAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Hidden Spring Training Mana Cost: -" + Math.round((totalEffect.hiddenSpringManaCostReductionAdd || 0) * 100) + "%";
        }
    },
    {
        key: "hiddenSpringPower",
        name: "Hidden Spring Power",
        class: "none",
        category: "buff",
        rarity: { rare: 9 },
        getEffect: function(rarity) {
            if (rarity === "rare") {
                return {
                    hiddenSpringPowerExpFlat: 10,
                    hiddenSpringPowerTrainingFlat: 0.1,
                    hiddenSpringPowerCostFlat: 100
                };
            }
            return {};
        },
        effectText: function(rarity) {
            return "Hidden Spring Training: +10 exp, +0.1 training, +100 mana cost";
        },
        totalBonusText: function(totalEffect) {
            return "Hidden Spring Training: +" + (totalEffect.hiddenSpringPowerExpFlat || 0) + " exp, +" +
                roundNearestDecimals(totalEffect.hiddenSpringPowerTrainingFlat || 0, 1) + " training, +" +
                (totalEffect.hiddenSpringPowerCostFlat || 0) + " mana cost";
        }
    },
    {
        key: "hiddenSpringSpeed",
        name: "Hidden Spring Speed",
        class: "none",
        category: "buff",
        rarity: { rare: 3, epic: 1 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { hiddenSpringDurationReduceMs: 6000 };
            if (rarity === "epic") return { hiddenSpringDurationReduceMs: 22000 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Hidden Spring Training Time: -" + Math.round((e.hiddenSpringDurationReduceMs || 0) / 1000) + "s";
        },
        totalBonusText: function(totalEffect) {
            return "Hidden Spring Training Time: -" + Math.round((totalEffect.hiddenSpringDurationReduceMs || 0) / 1000) + "s";
        }
    },
    {
        key: "hiddenSpringManaCapacity",
        name: "Hidden Spring Capacity",
        class: "none",
        category: "buff",
        rarity: { rare: 4 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { hiddenSpringManaCapacityAdd: 0.50 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Hidden Spring Mana Capacity: +" + Math.round((e.hiddenSpringManaCapacityAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Hidden Spring Mana Capacity: +" + Math.round((totalEffect.hiddenSpringManaCapacityAdd || 0) * 100) + "%";
        }
    },
    {
        key: "longerGuestStay",
        name: "Longer Guest Stay",
        class: "none",
        category: "buff",
        rarity: { rare: 4, epic: 1 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { innRestDurationFlat: 1 };
            if (rarity === "epic") return { innRestDurationFlat: 5 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Guest Rest Period: +" + (e.innRestDurationFlat || 0) + "s";
        },
        totalBonusText: function(totalEffect) {
            return "Guest Rest Period: +" + (totalEffect.innRestDurationFlat || 0) + "s";
        }
    },
    {
        key: "restfulnessBonus",
        name: "Restfulness Bonus",
        class: "none",
        category: "buff",
        rarity: { rare: 4, epic: 1 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { innRestfulnessPerSecFlat: 0.5 };
            if (rarity === "epic") return { innRestfulnessPerSecFlat: 2 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Restfulness: +" + (e.innRestfulnessPerSecFlat || 0) + "/s";
        },
        totalBonusText: function(totalEffect) {
            return "Restfulness: +" + (totalEffect.innRestfulnessPerSecFlat || 0) + "/s";
        }
    },
    {
        key: "starBeadBonus",
        name: "Star Bead Bonus",
        class: "none",
        category: "buff",
        rarity: { common: -1, rare: 3, epic: 1 },
        getEffect: function(rarity) {
            if (rarity === "common") return { starBeadAdd: 0.10 };
            if (rarity === "rare") return { starBeadAdd: 0.30 };
            if (rarity === "epic") return { starBeadAdd: 1.00 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Star Beads: +" + Math.round((e.starBeadAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Star Beads: +" + Math.round((totalEffect.starBeadAdd || 0) * 100) + "%";
        }
    },
    {
        key: "intruderCoinBonus",
        name: "Intruder Coin Bonus",
        class: "none",
        category: "buff",
        rarity: { common: -1, rare: 3, epic: 1 },
        getEffect: function(rarity) {
            if (rarity === "common") return { intruderCoinAdd: 0.10 };
            if (rarity === "rare") return { intruderCoinAdd: 0.30 };
            if (rarity === "epic") return { intruderCoinAdd: 1.00 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Intruder Coins: +" + Math.round((e.intruderCoinAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Intruder Coins: +" + Math.round((totalEffect.intruderCoinAdd || 0) * 100) + "%";
        }
    },
    {
        key: "visitorRepetition",
        name: "Visitor Repetition",
        class: "none",
        category: "buff",
        rarity: { rare: 3, epic: 1 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { visitorRepetitionChance: 0.05 };
            if (rarity === "epic") return { visitorRepetitionChance: 0.25 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Visitor Repetition Chance: +" + Math.round((e.visitorRepetitionChance || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Visitor Repetition Chance: +" + Math.round((totalEffect.visitorRepetitionChance || 0) * 100) + "%";
        }
    },
    {
        key: "okamiPathSpeed",
        name: "Okami Path Speed Bonus",
        class: "none",
        category: "buff",
        rarity: { rare: 4 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { okamiPathSpeedAdd: 0.50 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Okami Path Speed: +" + Math.round((e.okamiPathSpeedAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Okami Path Speed: +" + Math.round((totalEffect.okamiPathSpeedAdd || 0) * 100) + "%";
        }
    },
    {
        key: "okamiStoneBonus",
        name: "Okami Stone Bonus",
        class: "none",
        category: "buff",
        rarity: { rare: 2, epic: 1 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { okamiStoneFlat: 1 };
            if (rarity === "epic") return { okamiStoneFlat: 3 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Clear Rocks / Collect Stone: +" + (e.okamiStoneFlat || 0) + " stone";
        },
        totalBonusText: function(totalEffect) {
            return "Clear Rocks / Collect Stone: +" + (totalEffect.okamiStoneFlat || 0) + " stone";
        }
    },
    {
        key: "carrierSpeedBonus",
        name: "Carrier Speed Bonus",
        class: "none",
        category: "buff",
        rarity: { rare: 5 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { carrierSpeedAdd: 0.10 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Carrier Speed: +" + Math.round((e.carrierSpeedAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Carrier Speed: +" + Math.round((totalEffect.carrierSpeedAdd || 0) * 100) + "%";
        }
    },
    {
        key: "waterPumpMult",
        name: "Water Pump Mult",
        class: "none",
        category: "buff",
        rarity: { rare: 4 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { waterPumpAdd: 0.50 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Water Pump: +" + Math.round((e.waterPumpAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Water Pump: +" + Math.round((totalEffect.waterPumpAdd || 0) * 100) + "%";
        }
    },
    {
        key: "wishingWellMult",
        name: "Wishing Well Mult",
        class: "none",
        category: "buff",
        rarity: { rare: 4 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { wishingWellCoinAdd: 0.50 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Wishing Well Coins: +" + Math.round((e.wishingWellCoinAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Wishing Well Coins: +" + Math.round((totalEffect.wishingWellCoinAdd || 0) * 100) + "%";
        }
    },
    {
        key: "foxDenQueueAmount",
        name: "Fox Den Queue Amount",
        class: "none",
        category: "buff",
        rarity: { rare: 2 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { foxDenQueueFlat: 1 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Fox Den Queue Slots: +" + (e.foxDenQueueFlat || 0);
        },
        totalBonusText: function(totalEffect) {
            return "Fox Den Queue Slots: +" + (totalEffect.foxDenQueueFlat || 0);
        }
    },
    {
        key: "toriiKitsunePower",
        name: "Kitsune Power on Torii Gate",
        class: "none",
        category: "buff",
        rarity: { rare: 3, epic: 1 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { toriiWorkerTimerReduceMs: 1000 };
            if (rarity === "epic") return { toriiWorkerTimerReduceMs: 3000 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Torii Worker Completion: -" + Math.round((e.toriiWorkerTimerReduceMs || 0) / 1000) + "s visitor timer";
        },
        totalBonusText: function(totalEffect) {
            return "Torii Worker Completion: -" + Math.round((totalEffect.toriiWorkerTimerReduceMs || 0) / 1000) + "s visitor timer";
        }
    },
    {
        key: "bonfireHeatGain",
        name: "Bonfire Heat Gain",
        class: "none",
        category: "buff",
        rarity: { common: 11, rare: 3, epic: 1 },
        getEffect: function(rarity) {
            if (rarity === "common") return { bonfireHeatAdd: 0.10 };
            if (rarity === "rare") return { bonfireHeatAdd: 0.30 };
            if (rarity === "epic") return { bonfireHeatAdd: 1.00 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Bonfire Heat From Wood/Coal: +" + Math.round((e.bonfireHeatAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Bonfire Heat From Wood/Coal: +" + Math.round((totalEffect.bonfireHeatAdd || 0) * 100) + "%";
        }
    }
];

var shrineCards = {
    keysInOrder: SHRINE_CARD_DEFINITION_ROWS.map(function(r) {
        return r.key;
    }),
    _byKey: (function() {
        const m = {};
        for (let i = 0; i < SHRINE_CARD_DEFINITION_ROWS.length; i++) {
            const r = SHRINE_CARD_DEFINITION_ROWS[i];
            m[r.key] = r;
        }
        return m;
    })(),

    rarityOrder: SHRINE_CARD_RARITY_ORDER.slice(),

    createFreshCardOwned: function(key) {
        const d = shrineCards._byKey[key];
        const o = {};
        if (!d || !d.rarity) {
            return o;
        }
        const rarities = Object.keys(d.rarity);
        for (let i = 0; i < rarities.length; i++) {
            o[rarities[i]] = 0;
        }
        return o;
    },

    createFreshCardsState: function() {
        const o = {};
        for (let i = 0; i < shrineCards.keysInOrder.length; i++) {
            const k = shrineCards.keysInOrder[i];
            o[k] = shrineCards.createFreshCardOwned(k);
        }
        return o;
    },

    ensureCardsState: function(shrine) {
        if (!shrine) {
            return;
        }
        if (!shrine.cards || typeof shrine.cards !== "object") {
            shrine.cards = shrineCards.createFreshCardsState();
            return;
        }
        for (let i = 0; i < shrineCards.keysInOrder.length; i++) {
            const k = shrineCards.keysInOrder[i];
            const def = shrineCards._byKey[k];
            if (!shrine.cards[k] || typeof shrine.cards[k] !== "object") {
                shrine.cards[k] = shrineCards.createFreshCardOwned(k);
                continue;
            }
            const owned = shrine.cards[k];
            const rarities = Object.keys(def.rarity || {});
            for (let ri = 0; ri < rarities.length; ri++) {
                const r = rarities[ri];
                if (owned[r] === undefined || owned[r] === null || isNaN(owned[r])) {
                    owned[r] = 0;
                } else {
                    owned[r] = Math.max(0, Math.floor(owned[r]));
                }
            }
        }
    },

    getCardsState: function() {
        const shrine = data.progress && data.progress.base && data.progress.base.shrine;
        if (!shrine) {
            return null;
        }
        shrineCards.ensureCardsState(shrine);
        return shrine.cards;
    },

    getOwned: function(key, rarity) {
        const cards = shrineCards.getCardsState();
        if (!cards || !cards[key]) {
            return 0;
        }
        return cards[key][rarity] || 0;
    },

    hasAnyOwnedForKey: function(key) {
        const def = shrineCards._byKey[key];
        if (!def || !def.rarity) {
            return false;
        }
        const rarities = Object.keys(def.rarity);
        for (let i = 0; i < rarities.length; i++) {
            if (shrineCards.getOwned(key, rarities[i]) > 0) {
                return true;
            }
        }
        return false;
    },

    hasAnyOwned: function() {
        for (let i = 0; i < shrineCards.keysInOrder.length; i++) {
            if (shrineCards.hasAnyOwnedForKey(shrineCards.keysInOrder[i])) {
                return true;
            }
        }
        return false;
    },

    getReceivedKeys: function() {
        const buffs = [];
        const uniques = [];
        for (let i = 0; i < shrineCards.keysInOrder.length; i++) {
            const k = shrineCards.keysInOrder[i];
            if (!shrineCards.hasAnyOwnedForKey(k)) {
                continue;
            }
            const def = shrineCards._byKey[k];
            if (def.category === "unique") {
                uniques.push(k);
            } else {
                buffs.push(k);
            }
        }
        return buffs.concat(uniques);
    },

    getTotalEffect: function(key) {
        const def = shrineCards._byKey[key];
        const out = {};
        if (!def || !def.rarity || !def.getEffect) {
            return out;
        }
        const rarities = Object.keys(def.rarity);
        for (let i = 0; i < rarities.length; i++) {
            const r = rarities[i];
            const n = shrineCards.getOwned(key, r);
            if (n <= 0) {
                continue;
            }
            let e = {};
            try {
                e = def.getEffect(r) || {};
            } catch (err) {
                e = {};
            }
            const fields = Object.keys(e);
            for (let fi = 0; fi < fields.length; fi++) {
                const f = fields[fi];
                out[f] = (out[f] || 0) + (e[f] || 0) * n;
            }
        }
        return out;
    },

    getAggregatedEffects: function() {
        const out = {};
        for (let i = 0; i < shrineCards.keysInOrder.length; i++) {
            const e = shrineCards.getTotalEffect(shrineCards.keysInOrder[i]);
            const fields = Object.keys(e);
            for (let fi = 0; fi < fields.length; fi++) {
                const f = fields[fi];
                out[f] = (out[f] || 0) + (e[f] || 0);
            }
        }
        return out;
    },

    getRowBonusText: function(key) {
        const def = shrineCards._byKey[key];
        if (!def || !def.totalBonusText) {
            return "";
        }
        try {
            return def.totalBonusText(shrineCards.getTotalEffect(key)) || "";
        } catch (err) {
            return "";
        }
    },

    formatMax: function(max) {
        if (max === -1) {
            return "∞";
        }
        return String(max);
    },

    grant: function(key, rarity, n) {
        const def = shrineCards._byKey[key];
        if (!def || !def.rarity || def.rarity[rarity] === undefined) {
            return false;
        }
        const amount = n === undefined || n === null ? 1 : Math.floor(n);
        if (amount <= 0) {
            return false;
        }
        const cards = shrineCards.getCardsState();
        if (!cards) {
            return false;
        }
        if (!cards[key]) {
            cards[key] = shrineCards.createFreshCardOwned(key);
        }
        cards[key][rarity] = (cards[key][rarity] || 0) + amount;
        if (key === "bambooBaseChips" && typeof engine !== "undefined" && engine.refreshBambooForestBaseChips) {
            engine.refreshBambooForestBaseChips();
        }
        if (key === "baseAudacity" || key === "baseEgoDamage") {
            if (typeof initialize !== "undefined" && initialize.calcPlayerStats) {
                initialize.calcPlayerStats(false);
            }
        }
        return true;
    },

    debugGrant: function(key, rarity, n) {
        return shrineCards.grant(key, rarity, n);
    }
};
