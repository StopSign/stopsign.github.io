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
        rarity: { common: -1, rare: 6, epic: 2 },
        getEffect: function(rarity) {
            if (rarity === "common") return { manaRegenAdd: 0.05 };
            if (rarity === "rare") return { manaRegenAdd: 0.15 };
            if (rarity === "epic") return { manaRegenAdd: 0.40 };
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
        rarity: { rare: 6, epic: 2 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { manaCapacityAdd: 0.15 };
            if (rarity === "epic") return { manaCapacityAdd: 0.40 };
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
        rarity: { common: -1, rare: 6, epic: 2 },
        getEffect: function(rarity) {
            if (rarity === "common") return { okamiExpAdd: 0.05 };
            if (rarity === "rare") return { okamiExpAdd: 0.15 };
            if (rarity === "epic") return { okamiExpAdd: 0.40 };
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
        rarity: { common: -1, rare: 5, epic: 2 },
        getEffect: function(rarity) {
            if (rarity === "common") return { skillExpAdd: 0.03 };
            if (rarity === "rare") return { skillExpAdd: 0.10 };
            if (rarity === "epic") return { skillExpAdd: 0.25 };
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
        rarity: { common: -1, rare: 5, epic: 2 },
        getEffect: function(rarity) {
            if (rarity === "common") return { talentExpAdd: 0.03 };
            if (rarity === "rare") return { talentExpAdd: 0.10 };
            if (rarity === "epic") return { talentExpAdd: 0.25 };
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
        rarity: { rare: 4, epic: 1 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { manaPerDeadCloneAdd: 0.10 };
            if (rarity === "epic") return { manaPerDeadCloneAdd: 0.30 };
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
        name: "Base Clone Audacity",
        class: "none",
        category: "buff",
        rarity: { common: -1, rare: 5, epic: 2 },
        getEffect: function(rarity) {
            if (rarity === "common") return { baseAudFlat: 1 };
            if (rarity === "rare") return { baseAudFlat: 3 };
            if (rarity === "epic") return { baseAudFlat: 8 };
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
        name: "Base Clone Ego Damage",
        class: "none",
        category: "buff",
        rarity: { common: -1, rare: 5, epic: 2 },
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
        rarity: { common: -1, rare: 6, epic: 2 },
        getEffect: function(rarity) {
            if (rarity === "common") return { spiritStrandsAdd: 0.05 };
            if (rarity === "rare") return { spiritStrandsAdd: 0.15 };
            if (rarity === "epic") return { spiritStrandsAdd: 0.40 };
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
        rarity: { common: -1, rare: 6, epic: 2 },
        getEffect: function(rarity) {
            if (rarity === "common") return { chopPowerAdd: 0.05 };
            if (rarity === "rare") return { chopPowerAdd: 0.15 };
            if (rarity === "epic") return { chopPowerAdd: 0.40 };
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
        rarity: { common: -1, rare: 5, epic: 2 },
        getEffect: function(rarity) {
            if (rarity === "common") return { bambooBaseChipsFlat: 2 };
            if (rarity === "rare") return { bambooBaseChipsFlat: 5 };
            if (rarity === "epic") return { bambooBaseChipsFlat: 15 };
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
        rarity: { common: -1, rare: 6, epic: 2 },
        getEffect: function(rarity) {
            if (rarity === "common") return { orbExpAdd: 0.05 };
            if (rarity === "rare") return { orbExpAdd: 0.15 };
            if (rarity === "epic") return { orbExpAdd: 0.40 };
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
        rarity: { common: 10, rare: 6, epic: 2 },
        getEffect: function(rarity) {
            if (rarity === "common") return { cloneBaseCostReduction: 25 };
            if (rarity === "rare") return { cloneBaseCostReduction: 50 };
            if (rarity === "epic") return { cloneBaseCostReduction: 250 };
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
        rarity: { common: -1, rare: 6, epic: 2 },
        getEffect: function(rarity) {
            if (rarity === "common") return { researchSpeedAdd: 0.05 };
            if (rarity === "rare") return { researchSpeedAdd: 0.15 };
            if (rarity === "epic") return { researchSpeedAdd: 0.40 };
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
        rarity: { rare: 9 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { hiddenSpringManaCostReductionAdd: 0.10 };
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
        rarity: { rare: 6, epic: 2 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { hiddenSpringDurationReduceMs: 5000 };
            if (rarity === "epic") return { hiddenSpringDurationReduceMs: 10000 };
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
        rarity: { rare: 6, epic: 2 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { innRestDurationFlat: 1 };
            if (rarity === "epic") return { innRestDurationFlat: 3 };
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
        rarity: { rare: 6, epic: 2 },
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
        rarity: { common: -1, rare: 6, epic: 2 },
        getEffect: function(rarity) {
            if (rarity === "common") return { starBeadAdd: 0.05 };
            if (rarity === "rare") return { starBeadAdd: 0.15 };
            if (rarity === "epic") return { starBeadAdd: 0.40 };
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
        rarity: { common: -1, rare: 6, epic: 2 },
        getEffect: function(rarity) {
            if (rarity === "common") return { intruderCoinAdd: 0.05 };
            if (rarity === "rare") return { intruderCoinAdd: 0.15 };
            if (rarity === "epic") return { intruderCoinAdd: 0.40 };
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
        rarity: { rare: 6, epic: 2 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { visitorRepetitionChance: 0.05 };
            if (rarity === "epic") return { visitorRepetitionChance: 0.15 };
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
        rarity: { rare: 3, epic: 1 },
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
        rarity: { rare: 6, epic: 2 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { carrierSpeedAdd: 0.1 };
            if (rarity === "epic") return { carrierSpeedAdd: 0.2 };
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
        rarity: { rare: 3 },
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
        rarity: { rare: 6, epic: 2 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { toriiWorkerTimerReduceMs: 500 };
            if (rarity === "epic") return { toriiWorkerTimerReduceMs: 2000 };
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
        rarity: { common: 12, rare: 6, epic: 2 },
        getEffect: function(rarity) {
            if (rarity === "common") return { bonfireHeatAdd: 0.05 };
            if (rarity === "rare") return { bonfireHeatAdd: 0.15 };
            if (rarity === "epic") return { bonfireHeatAdd: 0.40 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Bonfire Heat From Wood/Coal: +" + Math.round((e.bonfireHeatAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Bonfire Heat From Wood/Coal: +" + Math.round((totalEffect.bonfireHeatAdd || 0) * 100) + "%";
        }
    },
    {
        key: "higherMaxOrbFloors",
        name: "Higher Max Orb Floors",
        class: "none",
        category: "unique",
        rarity: { rare: 6 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { higherMaxOrbFloorsFlat: 1 };
            return {};
        },
        effectText: function(rarity) {
            return "Orb Max Floors: +1";
        },
        totalBonusText: function(totalEffect) {
            return "Orb Max Floors: +" + (totalEffect.higherMaxOrbFloorsFlat || 0);
        }
    },
    {
        key: "duplicateStoneSpeed",
        name: "Duplicate Stone Speed",
        class: "none",
        category: "buff",
        rarity: { rare: 6, epic: 2 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { stoneDupeSpeedAdd: 0.15 };
            if (rarity === "epic") return { stoneDupeSpeedAdd: 0.40 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Stone Duplicator Speed: +" + Math.round((e.stoneDupeSpeedAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Stone Duplicator Speed: +" + Math.round((totalEffect.stoneDupeSpeedAdd || 0) * 100) + "%";
        }
    },
    {
        key: "moreMarketExp",
        name: "More Market Exp",
        class: "none",
        category: "buff",
        rarity: { rare: 6, epic: 2 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { marketExpAdd: 0.15 };
            if (rarity === "epic") return { marketExpAdd: 0.40 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Market Exp: +" + Math.round((e.marketExpAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Market Exp: +" + Math.round((totalEffect.marketExpAdd || 0) * 100) + "%";
        }
    },
    {
        key: "boostShardDropRates",
        name: "Boost Shard Drop Rates",
        class: "none",
        category: "buff",
        rarity: { common: 12, rare: 6, epic: 2 },
        getEffect: function(rarity) {
            if (rarity === "common") return { shardDropChanceAdd: 0.05 };
            if (rarity === "rare") return { shardDropChanceAdd: 0.15 };
            if (rarity === "epic") return { shardDropChanceAdd: 0.40 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Shard Drop Chance: +" + Math.round((e.shardDropChanceAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Shard Drop Chance: +" + Math.round((totalEffect.shardDropChanceAdd || 0) * 100) + "%";
        }
    },
    {
        key: "levelingExpBonus",
        name: "Leveling Exp Bonus",
        class: "none",
        category: "buff",
        rarity: { common: 12, rare: 6, epic: 2 },
        getEffect: function(rarity) {
            if (rarity === "common") return { levelingExpAdd: 0.05 };
            if (rarity === "rare") return { levelingExpAdd: 0.15 };
            if (rarity === "epic") return { levelingExpAdd: 0.40 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Clone Leveling Exp: +" + Math.round((e.levelingExpAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Clone Leveling Exp: +" + Math.round((totalEffect.levelingExpAdd || 0) * 100) + "%";
        }
    },
    {
        key: "freeResearchLevels",
        name: "Free Research Levels",
        class: "none",
        category: "unique",
        rarity: { epic: 4 },
        getEffect: function(rarity) {
            if (rarity === "epic") return { freeResearchLevelsFlat: 1 };
            return {};
        },
        effectText: function(rarity) {
            return "Free Research Choices: +1 (does not raise research/weave cost)";
        },
        totalBonusText: function(totalEffect) {
            return "Free Research Choices: +" + (totalEffect.freeResearchLevelsFlat || 0);
        }
    },
    {
        key: "spiritTrainingSpotAvailable",
        name: "Spirit Training Spot Available",
        class: "none",
        category: "unique",
        rarity: { epic: 1 },
        getEffect: function(rarity) {
            if (rarity === "epic") return { spiritTrainingSpotAvailable: 1 };
            return {};
        },
        effectText: function(rarity) {
            return "After prestige: Spirit Training Spot bought, Hidden Spring starts at full mana capacity";
        },
        totalBonusText: function(totalEffect) {
            return "After prestige: Spirit Training Spot bought, Hidden Spring starts at full mana capacity";
        }
    },
    {
        key: "roadWork",
        name: "Road Work",
        class: "none",
        category: "buff",
        rarity: { rare: 7, epic: 1 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { dirtRoadMaxProgressFlat: 10 };
            if (rarity === "epic") return { dirtRoadMaxProgressFlat: 30, prestigeFormDirtRoads: 1 };
            return {};
        },
        effectText: function(rarity) {
            if (rarity === "epic") {
                return "Dirt Road Max Progress: +50; Form Dirt Roads unlocked after prestige";
            }
            return "Dirt Road Max Progress: +10";
        },
        totalBonusText: function(totalEffect) {
            let t = "Dirt Road Max Progress: +" + (totalEffect.dirtRoadMaxProgressFlat || 0);
            if ((totalEffect.prestigeFormDirtRoads || 0) > 0) {
                t += "; Form Dirt Roads unlocked after prestige";
            }
            return t;
        }
    },
    {
        key: "tradersBargain",
        name: "Traders Bargain",
        class: "none",
        category: "buff",
        rarity: { epic: 4 },
        getEffect: function(rarity) {
            if (rarity === "epic") return { marketTradeYieldAdd: 0.25 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Market Trade Yield: +" + Math.round((e.marketTradeYieldAdd || 0) * 100) + "%";
        },
        totalBonusText: function(totalEffect) {
            return "Market Trade Yield: +" + Math.round((totalEffect.marketTradeYieldAdd || 0) * 100) + "%";
        }
    },
    {
        key: "traderSpeed",
        name: "Trader Speed",
        class: "none",
        category: "buff",
        rarity: { rare: 4 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { marketTradeDurationReduceSec: 5 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Market Trade Base Time: -" + (e.marketTradeDurationReduceSec || 0) + "s";
        },
        totalBonusText: function(totalEffect) {
            return "Market Trade Base Time: -" + (totalEffect.marketTradeDurationReduceSec || 0) + "s";
        }
    },
    {
        key: "startingCoins",
        name: "Starting Coins",
        class: "none",
        category: "buff",
        rarity: { rare: 2, epic: 1 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { prestigeStartingCoinsFlat: 60 };
            if (rarity === "epic") return { prestigeStartingCoinsFlat: 160 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Starting Coins After Prestige: +" + (e.prestigeStartingCoinsFlat || 0);
        },
        totalBonusText: function(totalEffect) {
            return "Starting Coins After Prestige: +" + (totalEffect.prestigeStartingCoinsFlat || 0);
        }
    },
    {
        key: "startingKitsune",
        name: "Starting Kitsune",
        class: "none",
        category: "buff",
        rarity: { rare: 4, epic: 2 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { prestigeStartingKitsuneFlat: 1 };
            if (rarity === "epic") return { prestigeStartingKitsuneFlat: 2 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Starting Kitsune After Prestige: +" + (e.prestigeStartingKitsuneFlat || 0);
        },
        totalBonusText: function(totalEffect) {
            return "Starting Kitsune After Prestige: +" + (totalEffect.prestigeStartingKitsuneFlat || 0);
        }
    },
    {
        key: "initialBaseMana",
        name: "Initial Base Mana",
        class: "none",
        category: "buff",
        rarity: { rare: 4 },
        getEffect: function(rarity) {
            if (rarity === "rare") return { prestigeStartingManaCapacityFlat: 250 };
            return {};
        },
        effectText: function(rarity) {
            const e = this.getEffect(rarity);
            return "Starting Mana Capacity After Prestige: +" + (e.prestigeStartingManaCapacityFlat || 0);
        },
        totalBonusText: function(totalEffect) {
            return "Starting Mana Capacity After Prestige: +" + (totalEffect.prestigeStartingManaCapacityFlat || 0);
        }
    }
];

(function initShrineCardRarityKeys() {
    for (let i = 0; i < SHRINE_CARD_DEFINITION_ROWS.length; i++) {
        const r = SHRINE_CARD_DEFINITION_ROWS[i];
        r.rarityKeys = Object.keys(r.rarity || {});
    }
})();

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

    _aggregatedCache: null,

    invalidateAggregatedEffects: function() {
        shrineCards._aggregatedCache = null;
    },

    createFreshCardOwned: function(key) {
        const d = shrineCards._byKey[key];
        const o = {};
        if (!d) {
            return o;
        }
        const rarities = d.rarityKeys || [];
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

    getCardsState: function() {
        return data.progress.base.shrine.cards;
    },

    getOwned: function(key, rarity) {
        const card = shrineCards.getCardsState()[key];
        return (card && card[rarity]) || 0;
    },

    hasAnyOwnedForKey: function(key) {
        const def = shrineCards._byKey[key];
        if (!def) {
            return false;
        }
        const rarities = def.rarityKeys || [];
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
        if (!def || !def.getEffect) {
            return out;
        }
        const rarities = def.rarityKeys || [];
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
        if (shrineCards._aggregatedCache) {
            return shrineCards._aggregatedCache;
        }
        const out = {};
        for (let i = 0; i < shrineCards.keysInOrder.length; i++) {
            const e = shrineCards.getTotalEffect(shrineCards.keysInOrder[i]);
            const fields = Object.keys(e);
            for (let fi = 0; fi < fields.length; fi++) {
                const f = fields[fi];
                out[f] = (out[f] || 0) + (e[f] || 0);
            }
        }
        shrineCards._aggregatedCache = out;
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
        if (!cards[key] || typeof cards[key] !== "object") {
            cards[key] = shrineCards.createFreshCardOwned(key);
        }
        cards[key][rarity] = (cards[key][rarity] || 0) + amount;
        shrineCards.invalidateAggregatedEffects();
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
    },

    rarityLabel: function(rarity) {
        if (rarity === "common") return "Common";
        if (rarity === "rare") return "Rare";
        if (rarity === "epic") return "Epic";
        return "";
    },

    rarityBorder: {
        common: "#9fb6d5",
        rare: "#5d4ae8",
        epic: "#bc07ed"
    },

    rarityBackground: {
        common: "rgba(159, 182, 213, 0.5)",
        rare: "rgba(93, 74, 232, 0.5)",
        epic: "rgba(188, 7, 237, 0.5)"
    },

    packDefs: {
        common: {
            slots: 6,
            choose: 1,
            weights: { common: 85, rare: 14, epic: 1 },
            minRare: 0,
            minEpic: 0,
            oddsHtml: "6 cards with their own rolls for rarity:<br>85% Common Cards<br>14% Rare Cards<br>1% Epic Cards<br>Open and choose one!"
        },
        rare: {
            slots: 6,
            choose: 1,
            weights: { common: 70, rare: 27, epic: 3 },
            minRare: 2,
            minEpic: 0,
            oddsHtml: "6 cards with their own rolls for rarity:<br>70% Common Cards<br>27% Rare Cards<br>3% Epic Cards<br>At least 2 cards will be rare<br>Open and choose one!"
        },
        epic: {
            slots: 9,
            choose: 2,
            weights: { common: 40, rare: 50, epic: 10 },
            minRare: 0,
            minEpic: 1,
            oddsHtml: "9 cards with their own rolls for rarity:<br>40% Common Cards<br>50% Rare Cards<br>10% Epic Cards<br>At least 1 card will be epic<br>Open and choose two!"
        }
    },

    totalPacks: function(shrine) {
        const packs = (shrine && shrine.packs) || {};
        return (packs.common || 0) + (packs.rare || 0) + (packs.epic || 0);
    },

    nextUnopenedPackRarity: function(shrine) {
        const packs = (shrine && shrine.packs) || {};
        if ((packs.common || 0) > 0) return "common";
        if ((packs.rare || 0) > 0) return "rare";
        if ((packs.epic || 0) > 0) return "epic";
        return null;
    },

    actionButtonLabel: function(session, shrine) {
        const next = shrineCards.nextUnopenedPackRarity(shrine);
        if (!session || !session.openPack) {
            return "Open " + shrineCards.rarityLabel(next || (session && session.previewRarity)) + " Pack";
        }
        if (!next) {
            return "Choose Selected Cards";
        }
        return "Choose Selected Cards and Open " + shrineCards.rarityLabel(next) + " Pack";
    },

    createPrestigeSession: function(shrine) {
        return {
            active: true,
            phase: "choose",
            openPack: null,
            gained: [],
            previewRarity: shrineCards.nextUnopenedPackRarity(shrine)
        };
    },

    rollOneRarity: function(weights, rng) {
        const random = rng || Math.random;
        let roll = random() * 100;
        const order = ["common", "rare", "epic"];
        let acc = 0;
        for (let i = 0; i < order.length; i++) {
            acc += weights[order[i]] || 0;
            if (roll < acc) {
                return order[i];
            }
        }
        return "epic";
    },

    countRarity: function(slots, rarity) {
        let n = 0;
        for (let i = 0; i < slots.length; i++) {
            if (slots[i] === rarity) n++;
        }
        return n;
    },

    raritiesMeetMinimum: function(slots, def) {
        const rare = shrineCards.countRarity(slots, "rare");
        const epic = shrineCards.countRarity(slots, "epic");
        return rare >= (def.minRare || 0) && epic >= (def.minEpic || 0);
    },

    forcePackMinimum: function(slots, def) {
        let rare = shrineCards.countRarity(slots, "rare");
        while (rare < (def.minRare || 0)) {
            let ix = slots.indexOf("common");
            if (ix < 0) {
                ix = slots.indexOf("epic");
                if (ix < 0) break;
                if (shrineCards.countRarity(slots, "epic") - 1 < (def.minEpic || 0)) break;
            }
            slots[ix] = "rare";
            rare++;
        }
        let epic = shrineCards.countRarity(slots, "epic");
        while (epic < (def.minEpic || 0)) {
            let ix = slots.indexOf("common");
            if (ix < 0) ix = slots.indexOf("rare");
            if (ix < 0) break;
            if (slots[ix] === "rare") rare--;
            slots[ix] = "epic";
            epic++;
        }
        while (rare < (def.minRare || 0)) {
            const ix = slots.indexOf("common");
            if (ix < 0) break;
            slots[ix] = "rare";
            rare++;
        }
        return slots;
    },

    rollPackRarities: function(packRarity, rng) {
        const random = rng || Math.random;
        const def = shrineCards.packDefs[packRarity];
        const maxAttempts = 40;
        let slots = [];
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            slots = [];
            for (let i = 0; i < def.slots; i++) {
                slots.push(shrineCards.rollOneRarity(def.weights, random));
            }
            if (shrineCards.raritiesMeetMinimum(slots, def)) {
                return slots;
            }
        }
        return shrineCards.forcePackMinimum(slots, def);
    },

    copiesRemaining: function(key, rarity, reserved) {
        const def = shrineCards._byKey[key];
        if (!def || !def.rarity || def.rarity[rarity] === undefined) {
            return 0;
        }
        const max = def.rarity[rarity];
        if (max === -1) {
            return Infinity;
        }
        const owned = shrineCards.getOwned(key, rarity);
        const held = (reserved[key] && reserved[key][rarity]) || 0;
        return Math.max(0, max - owned - held);
    },

    eligibleKeys: function(rarity, reserved) {
        const keys = [];
        for (let i = 0; i < shrineCards.keysInOrder.length; i++) {
            const key = shrineCards.keysInOrder[i];
            if (shrineCards.copiesRemaining(key, rarity, reserved) > 0) {
                keys.push(key);
            }
        }
        return keys;
    },

    cardsForRarityRolls: function(rolls, rng) {
        const random = rng || Math.random;
        const reserved = {};
        const cards = [];
        for (let i = 0; i < rolls.length; i++) {
            let rarity = rolls[i];
            if (rarity === "epic" && shrineCards.eligibleKeys("epic", reserved).length === 0) {
                rarity = "rare";
            }
            if (rarity === "rare" && shrineCards.eligibleKeys("rare", reserved).length === 0) {
                rarity = "common";
            }
            let pool = shrineCards.eligibleKeys(rarity, reserved);
            if (!pool.length && rarity !== "common") {
                rarity = "common";
                pool = shrineCards.eligibleKeys("common", reserved);
            }
            if (!pool.length) {
                for (let k = 0; k < shrineCards.keysInOrder.length; k++) {
                    const key = shrineCards.keysInOrder[k];
                    const def = shrineCards._byKey[key];
                    if (def && def.rarity && def.rarity.common === -1) {
                        pool = [key];
                        rarity = "common";
                        break;
                    }
                }
            }
            if (!pool.length) {
                continue;
            }
            const key = pool[Math.floor(random() * pool.length)];
            if (!reserved[key]) reserved[key] = {};
            reserved[key][rarity] = (reserved[key][rarity] || 0) + 1;
            cards.push({ key: key, rarity: rarity });
        }
        return cards;
    },

    rollPackCards: function(packRarity, rng) {
        const random = rng || Math.random;
        return shrineCards.cardsForRarityRolls(shrineCards.rollPackRarities(packRarity, random), random);
    },

    sessionBonusLines: function(gained) {
        const totals = {};
        const list = gained || [];
        for (let i = 0; i < list.length; i++) {
            const g = list[i];
            const def = shrineCards._byKey[g.key];
            if (!def || !def.getEffect) continue;
            let effect = {};
            try {
                effect = def.getEffect(g.rarity) || {};
            } catch (err) {
                effect = {};
            }
            if (!totals[g.key]) totals[g.key] = {};
            const fields = Object.keys(effect);
            for (let fi = 0; fi < fields.length; fi++) {
                const f = fields[fi];
                totals[g.key][f] = (totals[g.key][f] || 0) + (effect[f] || 0);
            }
        }
        const lines = [];
        for (let i = 0; i < shrineCards.keysInOrder.length; i++) {
            const key = shrineCards.keysInOrder[i];
            if (!totals[key]) continue;
            const def = shrineCards._byKey[key];
            if (!def || !def.totalBonusText) continue;
            try {
                const text = def.totalBonusText(totals[key]) || "";
                if (text) lines.push(text);
            } catch (err) {}
        }
        return lines;
    },

    /**
     * Apply card starting bonuses immediately after finishPrestige rebuild.
     * Call after shrine.cards are restored and aggregated effects invalidated.
     */
    applyPrestigeStartBonuses: function() {
        const card = shrineCards.getAggregatedEffects();
        const progress = data.progress;
        if (!progress) {
            return;
        }

        const coinFlat = card.prestigeStartingCoinsFlat || 0;
        if (coinFlat > 0) {
            progress.coins = (progress.coins || 0) + coinFlat;
        }

        const kitsuneFlat = card.prestigeStartingKitsuneFlat || 0;
        if (kitsuneFlat > 0) {
            if (!progress.kitsune) {
                progress.kitsune = { total: 2 };
            }
            progress.kitsune.total = (progress.kitsune.total || 0) + kitsuneFlat;
        }

        const manaFlat = card.prestigeStartingManaCapacityFlat || 0;
        if (manaFlat > 0) {
            if (!progress.mana) {
                progress.mana = { amount: 0, capacityBonus: 0 };
            }
            progress.mana.capacityBonus = (progress.mana.capacityBonus || 0) + manaFlat;
            if (typeof engine !== "undefined" && engine.getManaCapacity) {
                progress.mana.amount = engine.getManaCapacity();
            }
        }

        const freeN = card.freeResearchLevelsFlat || 0;
        const archives = progress.base && progress.base.scrollArchives;
        if (archives) {
            archives.freeResearchCostCredit = freeN;
            if (freeN > 0) {
                archives.researchesToChoose = (archives.researchesToChoose || 0) + freeN;
            }
            if (typeof engine !== "undefined" && engine.syncScrollArchivesResearchCost) {
                engine.syncScrollArchivesResearchCost(archives);
            }
        }

        if ((card.spiritTrainingSpotAvailable || 0) > 0) {
            const hs = progress.base && progress.base.hiddenSpring;
            if (hs) {
                hs.spiritTrainingSpotBought = true;
                hs.mana = (typeof engine !== "undefined" && engine.getBuildingManaCapacity)
                    ? engine.getBuildingManaCapacity("hiddenSpring")
                    : (hs.manaCapacity || 40000);
            }
        }

        if ((card.prestigeFormDirtRoads || 0) > 0) {
            const atelier = progress.base && progress.base.atelier;
            if (atelier) {
                atelier.formDirtRoadsUnlocked = true;
            }
        }
    }
};
