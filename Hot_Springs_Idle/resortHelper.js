let resortHelper = {
    // Bamboo Forest
    isGrowHardwoodBought: function() {
        const bf = data.progress.base && data.progress.base.bambooForest;
        return !!((bf && bf.growHardwoodBought) || 0);
    },
    getBambooInfuseSoilMultiplier: function() {
        const bf = data.progress.base.bambooForest;
        const n = bf.infuseSoilBought || 0;
        if (n <= 0) {
            return 1;
        }
        return 1 + 0.2 * n + 0.025 * n * (n - 1);
    },
    getEchoedAxeBought: function() {
        const bf = data.progress.base && data.progress.base.bambooForest;
        return (bf && bf.echoedAxeBought) || 0;
    },

    // Hidden Spring
    getHiddenSpringSpiritSlotMax: function() {
        const hs = data.progress.base && data.progress.base.hiddenSpring;
        return hs ? (hs.spiritMax || 3) : 3;
    },
    getEarthSpiritPebbleMax: function() {
        const hs = data.progress.base && data.progress.base.hiddenSpring;
        const bought = hs ? (hs.pebbleCapacityBought || 0) : 0;
        return 1 + bought;
    },
    isSpiritTrainingSpotBought: function() {
        const hs = data.progress.base && data.progress.base.hiddenSpring;
        return !!(hs && hs.spiritTrainingSpotBought);
    },

    // Mine
    getPebblePayBought: function() {
        const mine = data.progress.base && data.progress.base.mine;
        return (mine && mine.pebblePayBought) || 0;
    },
    getMineshaftBeamsBought: function() {
        const mine = data.progress.base && data.progress.base.mine;
        return (mine && mine.mineshaftBeamsBought) || 0;
    },
    getPlayPitBought: function() {
        const mine = data.progress.base && data.progress.base.mine;
        return (mine && mine.playPitBought) || 0;
    },
    /** Same growth as Infuse Soil: +20%, then each purchase adds 5% more than the last. */
    getPlayPitDirtMultiplier: function() {
        const n = resortHelper.getPlayPitBought();
        if (n <= 0) {
            return 1;
        }
        return 1 + 0.2 * n + 0.025 * n * (n - 1);
    },

    // Bonfire
    getBuildUponCloneFoundationBought: function() {
        const bonfire = data.progress.base && data.progress.base.bonfire;
        return (bonfire && bonfire.buildUponCloneFoundationBought) || 0;
    },
    getContemplateSturdinessBought: function() {
        const bonfire = data.progress.base && data.progress.base.bonfire;
        return (bonfire && bonfire.contemplateSturdinessBought) || 0;
    },

    // Torii
    getNurturePlantSpiritMax: function() {
        const cfg = resortData.bambooForestConfig || {};
        const base = (cfg.plantSpiritMax || 3) + (resortHelper.isPlantAffinityBought() ? 1 : 0);
        const torii = data.progress.base && data.progress.base.torii;
        const bought = (torii && torii.plantSpiritsBought) || 0;
        const slots = cfg.stalkCount || 4;
        const free = Math.max(0, slots - engine.countPlantSpirits());
        return Math.min(base, bought + free);
    },

    // Noodle Bar
    getNoodleCrossTalkBought: function() {
        const bar = data.progress.base && data.progress.base.noodleBar;
        return (bar && bar.crossTalkBought) || 0;
    },
    getNoodleComfyStoolsBought: function() {
        const bar = data.progress.base && data.progress.base.noodleBar;
        return (bar && bar.comfyStoolsBought) || 0;
    },
    getNoodleSturdyWallsBought: function() {
        const bar = data.progress.base && data.progress.base.noodleBar;
        return (bar && bar.sturdyWallsBought) || 0;
    },
    getNoodleTrophyDecorationsBought: function() {
        const bar = data.progress.base && data.progress.base.noodleBar;
        return (bar && bar.trophyDecorationsBought) || 0;
    },

    // Market
    getMarketMysticalGlovesBought: function() {
        const market = data.progress.base && data.progress.base.market;
        return (market && market.mysticalGlovesBought) || 0;
    },
    getMarketAnchoringRingBought: function() {
        const market = data.progress.base && data.progress.base.market;
        return (market && market.anchoringRingBought) || 0;
    },
    isMarketCookingEquipmentBought: function() {
        const market = data.progress.base && data.progress.base.market;
        return !!(market && market.cookingEquipmentBought);
    },
    isMarketTradingExperienceBought: function() {
        const market = data.progress.base && data.progress.base.market;
        return !!(market && market.tradingExperienceBought);
    },
    getMarketBuyAdvertisingBought: function() {
        const market = data.progress.base && data.progress.base.market;
        return (market && market.buyAdvertisingBought) || 0;
    },
    getLiteracyLessonsBought: function() {
        const market = data.progress.base && data.progress.base.market;
        return (market && market.literacyLessonsBought) || 0;
    },
    isForgingInstructionsBought: function() {
        const market = data.progress.base && data.progress.base.market;
        return !!(market && market.forgingInstructionsBought);
    },
    isLauncherDesignsBought: function() {
        const market = data.progress.base && data.progress.base.market;
        return !!(market && market.launcherDesignsBought);
    },
    getLostScrollsBought: function() {
        const market = data.progress.base && data.progress.base.market;
        return (market && market.lostScrollsBought) || 0;
    },

    // Stone Pile
    getEchoedShelvingBought: function() {
        const pile = data.progress.base && data.progress.base.stonePile;
        return (pile && pile.echoedShelvingBought) || 0;
    },

    // Atelier
    getLargerForgeBought: function() {
        const atelier = data.progress.base && data.progress.base.atelier;
        return (atelier && atelier.largerForgeBought) || 0;
    },

    // Orb
    getOrbBuildWallsBought: function() {
        const orb = data.progress.base && data.progress.base.mage_tower;
        return (orb && orb.buildWallsBought) || 0;
    },
    getOrbBuildStairsBought: function() {
        const orb = data.progress.base && data.progress.base.mage_tower;
        return (orb && orb.buildStairsBought) || 0;
    },
    getOrbBuildFloorBought: function() {
        const orb = data.progress.base && data.progress.base.mage_tower;
        return (orb && orb.buildFloorBought) || 0;
    },
    getOrbMaxFloors: function() {
        const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().higherMaxOrbFloorsFlat || 0) : 0;
        return 2 + cardAdd + resortHelper.getOrbHeightBought();
    },
    getOrbFloorBonusMultiplier: function() {
        return 1 + 0.1 * resortHelper.getOrbBuildFloorBought();
    },

    // Scroll Archives
    getInfuseScribingsBought: function() {
        const lib = data.progress.base && data.progress.base.scrollArchives;
        return (lib && lib.infuseScribingsBought) || 0;
    },
    getSturdyShelvesBought: function() {
        const lib = data.progress.base && data.progress.base.scrollArchives;
        return (lib && lib.sturdyShelvesBought) || 0;
    },
    getCollectShardsMax: function() {
        return 5 + resortHelper.getShardEchoesBought();
    },
    getWorkspaceFurnitureBought: function() {
        const lib = data.progress.base && data.progress.base.scrollArchives;
        return (lib && lib.workspaceFurnitureBought) || 0;
    },

    // Shrine
    getShrineUpgradeBought: function(field) {
        const shrine = data.progress.base && data.progress.base.shrine;
        return (shrine && shrine[field]) || 0;
    },
    getShardEchoesBought: function() {
        return resortHelper.getShrineUpgradeBought("shardEchoesBought");
    },
    getArtAppreciationBought: function() {
        return resortHelper.getShrineUpgradeBought("artAppreciationBought");
    },
    getLanguageEchoesBought: function() {
        return resortHelper.getShrineUpgradeBought("languageEchoesBought");
    },
    getSkillEchoesBought: function() {
        return resortHelper.getShrineUpgradeBought("skillEchoesBought");
    },
    getSpiritWeavingEchoesBought: function() {
        return resortHelper.getShrineUpgradeBought("spiritWeavingEchoesBought");
    },
    isKarmaStackingBought: function() {
        return resortHelper.getShrineUpgradeBought("karmaStackingBought") > 0;
    },
    isPowerfulChopsBought: function() {
        return resortHelper.getShrineUpgradeBought("powerfulChopsBought") > 0;
    },
    isAxeEchoesBought: function() {
        return resortHelper.getShrineUpgradeBought("axeEchoesBought") > 0;
    },
    isShelvingEchoesBought: function() {
        return resortHelper.getShrineUpgradeBought("shelvingEchoesBought") > 0;
    },
    isPlantAffinityBought: function() {
        return resortHelper.getShrineUpgradeBought("plantAffinityBought") > 0;
    },
    isHardenBambooBought: function() {
        return resortHelper.getShrineUpgradeBought("hardenBambooBought") > 0;
    },
    isScribingInfusionsBought: function() {
        return resortHelper.getShrineUpgradeBought("scribingInfusionsBought") > 0;
    },
    isShardsFoundBought: function() {
        return resortHelper.getShrineUpgradeBought("shardsFoundBought") > 0;
    },
    isTradingContractsBought: function() {
        return resortHelper.getShrineUpgradeBought("tradingContractsBought") > 0;
    },
    isResourceProtectionBought: function() {
        return resortHelper.getShrineUpgradeBought("resourceProtectionBought") > 0;
    },
    isDealMakingBought: function() {
        return resortHelper.getShrineUpgradeBought("dealMakingBought") > 0;
    },
    getOrbHeightBought: function() {
        return resortHelper.getShrineUpgradeBought("orbHeightBought");
    },
    isSkyAppreciationBought: function() {
        return resortHelper.getShrineUpgradeBought("skyAppreciationBought") > 0;
    },
    isLimestoneCarvingBought: function() {
        return resortHelper.getShrineUpgradeBought("limestoneCarvingBought") > 0;
    },
    isWaterfallTrainingBought: function() {
        return resortHelper.getShrineUpgradeBought("waterfallTrainingBought") > 0;
    },
    isSpiritAncestorsBought: function() {
        return resortHelper.getShrineUpgradeBought("spiritAncestorsBought") > 0;
    },
    isSpiritAncestorGuidanceBought: function() {
        return resortHelper.getShrineUpgradeBought("spiritAncestorGuidanceBought") > 0;
    },
    isContainedSparkBought: function() {
        return resortHelper.getShrineUpgradeBought("containedSparkBought") > 0;
    },
    getEssenceGatheringBought: function() {
        return resortHelper.getShrineUpgradeBought("essenceGatheringBought");
    },
    isKeepRecordsBought: function() {
        return resortHelper.getShrineUpgradeBought("keepRecordsBought") > 0;
    },
    isKitsuneBalanceBought: function() {
        return resortHelper.getShrineUpgradeBought("kitsuneBalanceBought") > 0;
    },
    isCallTheGoddessBought: function() {
        return resortHelper.getShrineUpgradeBought("callTheGoddessBought") > 0;
    },
    isDonationDriveBought: function() {
        return resortHelper.getShrineUpgradeBought("donationDriveBought") > 0;
    },
    isWaterPowerBought: function() {
        return resortHelper.getShrineUpgradeBought("waterPowerBought") > 0;
    },
    isPrepareToWriteLegendBought: function() {
        const shrine = data.progress.base && data.progress.base.shrine;
        return !!(shrine && shrine.prepareToWriteLegendBought);
    }
};
