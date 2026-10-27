let skillEngine = {
    getAlacrityCooldownReductionMs: function() {
        const e = skills.getSkillEffect("alacrity");
        return e.effectiveLevel || 0;
    },
    /** Advance every clocked trigger and fire every continuous trigger once. */
    applyTriggerTicks: function(tickMs) {
        const names = Object.keys(SKILL_TRIGGER_TYPES);
        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const def = SKILL_TRIGGER_TYPES[name];
            if (def.periodMs) {
                skillEngine.advanceTriggerPeriod(name, def, tickMs);
            } else if (typeof def.tick === "function") {
                if (!skills.anyEquipped(name)) {
                    continue;
                }
                skills.fireTrigger(name, def.tick(tickMs));
            }
        }
    },
    advanceTriggerPeriod: function(name, def, tickMs) {
        if (typeof def.advanceWhen === "function" && !def.advanceWhen()) {
            return;
        }
        const key = "triggerAccMs_" + name;
        if (data.battle[key] === undefined || data.battle[key] === null) {
            data.battle[key] = 0;
        }
        const step = def.useBattleTime ? tickMs * engine.getBattleTimeRateMultiplier() : tickMs;
        data.battle[key] += step;
        while (data.battle[key] >= def.periodMs) {
            data.battle[key] -= def.periodMs;
            if (!skills.anyEquipped(name)) {
                continue;
            }
            if (typeof def.ready === "function" && !def.ready()) {
                continue;
            }
            const ctx = typeof def.context === "function" ? def.context() : {};
            skills.fireTrigger(name, ctx);
        }
    },
    updateStageSob: function(tickMs) {
        if (!skills.isSkillUnlocked("stageSob")) {
            return;
        }
        const visible = engine.countVisibleIntruders();
        if (visible <= 0) {
            return;
        }
        const sec = tickMs / 1000;
        const per = skills.getSkillEffect("stageSob").cloutPerVisible || 0;
        if (per > 0) {
            engine.addCloutStacks(per * visible * sec);
        }
    },
    updateSeetheEachSecond: function(tickMs) {
        if (!skills.isSkillUnlocked("seethe")) {
            return;
        }
        const farCount = engine.countVisibleIntrudersFurtherThan(200);
        if (farCount <= 0) {
            return;
        }
        if (data.battle.seetheSecondAccMs === undefined || data.battle.seetheSecondAccMs === null) {
            data.battle.seetheSecondAccMs = 0;
        }
        data.battle.seetheSecondAccMs += tickMs;
        while (data.battle.seetheSecondAccMs >= 500) {
            data.battle.seetheSecondAccMs -= 500;
            const eff = skills.getSkillEffect("seethe");
            const stacks = (eff.furyPerLevel || 0) * farCount;
            if (stacks > 0) {
                engine.addFuryStacks(stacks);
            }
        }
    },
    updateApplyTearDropsEachSecond: function(tickMs) {
        if (!skills.isSkillUnlocked("applyTearDrops")) {
            return;
        }
        if (engine.getIntruderPushBonusPxPerSecond() <= 0) {
            return;
        }
        if (data.battle.applyTearDropsAccMs === undefined || data.battle.applyTearDropsAccMs === null) {
            data.battle.applyTearDropsAccMs = 0;
        }
        data.battle.applyTearDropsAccMs += tickMs;
        while (data.battle.applyTearDropsAccMs >= 1000) {
            data.battle.applyTearDropsAccMs -= 1000;
            const eff = skills.getSkillEffect("applyTearDrops");
            const ms = eff.fakeTearsMs || 0;
            if (ms > 0) {
                engine.addFakeTearsMs(ms);
            }
        }
    },
    updateBitterRivalryInRange: function(tickMs) {
        if (!skills.isSkillUnlocked("bitterRivalry")) {
            return;
        }
        const enemies = data.battle.enemies || [];
        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            if (!e.alive || !e.inRange) {
                continue;
            }
            e.bitterRivalryInRangeAccMs = (e.bitterRivalryInRangeAccMs || 0) + tickMs;
            while (e.bitterRivalryInRangeAccMs >= 1000) {
                e.bitterRivalryInRangeAccMs -= 1000;
                e.bitterRivalrySeconds = (e.bitterRivalrySeconds || 0) + 1;
            }
        }
    },
    updateNumbingCrowdsEachSecond: function(tickMs) {
        if (!skills.isSkillUnlocked("numbingCrowds")) {
            return;
        }
        const closeCount = engine.countVisibleIntrudersCloserThan(200);
        if (closeCount <= 0) {
            return;
        }
        if (data.battle.numbingCrowdsSecondAccMs === undefined || data.battle.numbingCrowdsSecondAccMs === null) {
            data.battle.numbingCrowdsSecondAccMs = 0;
        }
        data.battle.numbingCrowdsSecondAccMs += tickMs;
        while (data.battle.numbingCrowdsSecondAccMs >= 1000) {
            data.battle.numbingCrowdsSecondAccMs -= 1000;
            const eff = skills.getSkillEffect("numbingCrowds");
            const ms = (eff.fakeTearsMsPerLevel || 0) * closeCount;
            if (ms > 0) {
                engine.addFakeTearsMs(ms);
            }
        }
    },
    updateSlowBurn: function(tickMs) {
        if (!skills.isSkillUnlocked("slowBurn")) {
            return;
        }
        if (!engine.anyIntruderInSlapRange()) {
            data.battle.slowBurnSeconds = 0;
            data.battle.slowBurnAccMs = 0;
            return;
        }
        if (data.battle.slowBurnAccMs === undefined || data.battle.slowBurnAccMs === null) {
            data.battle.slowBurnAccMs = 0;
        }
        if (data.battle.slowBurnSeconds === undefined || data.battle.slowBurnSeconds === null) {
            data.battle.slowBurnSeconds = 0;
        }
        data.battle.slowBurnAccMs += tickMs;
        while (data.battle.slowBurnAccMs >= 1000) {
            data.battle.slowBurnAccMs -= 1000;
            data.battle.slowBurnSeconds += 1;
        }
    },
    advanceBattleAccMs: function(key, tickMs, intervalMs, onTick) {
        if (data.battle[key] === undefined || data.battle[key] === null) {
            data.battle[key] = 0;
        }
        data.battle[key] += tickMs;
        while (data.battle[key] >= intervalMs) {
            data.battle[key] -= intervalMs;
            onTick();
        }
    },
    updateCombatSkillPeriodics: function(tickMs) {
        const moving = engine.isPlayerMovingForward();
        const atMax = engine.isPlayerAtMaxAud();

        skillEngine.advanceBattleAccMs("combatSkillSecondAccMs", tickMs, 1000, function() {
            if (moving && skills.isSkillUnlocked("walkingItOff")) {
                const walkEff = skills.getSkillEffect("walkingItOff");
                const regen = walkEff.audPerSec || 0;
                if (regen > 0) {
                    engine.grantPlayerCurrentAudGain(regen * engine.getConfidenceMultiplier(), "walkingItOff");
                }
            }
            if (atMax) {
                if (skills.isSkillUnlocked("simmer")) {
                    const simEff = skills.getSkillEffect("simmer");
                    const outrageAmt = simEff.outragePerSecond || 0;
                    if (outrageAmt > 0) {
                        engine.addOutrage(outrageAmt);
                    }
                }
            } else if (skills.isSkillUnlocked("imposterSyndrome")) {
                const isEff = skills.getSkillEffect("imposterSyndrome");
                const maliceAmt = isEff.malicePerLevel || 0;
                if (maliceAmt > 0) {
                    engine.addMalice(maliceAmt);
                }
            }
            if (atMax && skills.isSkillUnlocked("stoic")) {
                const stoEff = skills.getSkillEffect("stoic");
                const ms = stoEff.desensitizedMsPerLevel || 0;
                if (ms > 0) {
                    engine.addDesensitizedStack(ms);
                }
            }
            if (atMax && skills.isSkillUnlocked("brandRecognition")) {
                const brEff = skills.getSkillEffect("brandRecognition");
                const clout = brEff.cloutPerSec || 0;
                if (clout > 0) {
                    engine.addCloutStacks(clout);
                }
            }
        });
    },
    trySecondWindRestore: function() {
        if (!skills.isSkillUnlocked("secondWind") || data.battle.secondWindRestoreUsed) {
            return;
        }
        if (!engine.isPlayerBelowAudFraction(0.2)) {
            return;
        }
        const swEff = skills.getSkillEffect("secondWind");
        const maxAud = (data.battle.player && data.battle.player.maxAud) || 0;
        const heal = ((swEff.restoreAudFlat || 0) * engine.getConfidenceMultiplier())
            + ((swEff.restoreAudMaxFraction || 0) * maxAud);
        if (!(heal > 0)) {
            return;
        }
        data.battle.secondWindRestoreUsed = true;
        engine.grantPlayerCurrentAudGain(heal, "secondWind");
    },
    onPlayerTookDamage: function() {
        skillEngine.trySecondWindRestore();
        if (skills.isSkillUnlocked("thinIce")) {
            const iceEff = skills.getSkillEffect("thinIce");
            const iceFury = iceEff.furyPerLevel || 0;
            if (iceFury > 0) {
                engine.addFuryStacks(iceFury);
            }
        }
    },
    updateSelfAffirmationsEachSecond: function(tickMs) {
        if (data.battle.selfAffirmationsSecondAccMs === undefined) {
            data.battle.selfAffirmationsSecondAccMs = 0;
        }
        data.battle.selfAffirmationsSecondAccMs += tickMs;
        while (data.battle.selfAffirmationsSecondAccMs >= 1000) {
            data.battle.selfAffirmationsSecondAccMs -= 1000;
            const rEff = skills.getSkillEffect("selfAffirmations");
            const regen = rEff.audPerSec || 0;
            if (regen > 0) {
                engine.grantPlayerCurrentAudGain(regen * engine.getConfidenceMultiplier(), "selfAffirmations");
            }
        }
    },
    applyOverkillAttackProgressAfterKill: function(kind) {
        if ((data.progress.currentClassKey || "none") !== "condescend") {
            return;
        }
        const want = skills.getSkillEffect("overkill").barBonusPerLevelMs || 0;
        if (want <= 0) {
            return;
        }
        const p = data.battle.player;
        const cd = kind === "sandal" ? engine.getEffectiveSandalCooldownMs() : engine.getEffectiveSlapCooldownMs();
        const floorMs = kind === "sandal" ? gameData.battle.cooldowns.sandalFloorMs : gameData.battle.cooldowns.slapFloorMs;
        const maxSkip = Math.max(0, cd - floorMs);
        const applied = Math.min(want, maxSkip);
        if (applied <= 0) {
            return;
        }
        if (kind === "sandal") {
            p.sandalAttackTimerMs = Math.max(0, (p.sandalAttackTimerMs || 0) - applied);
        } else {
            p.attackTimerMs = Math.max(0, (p.attackTimerMs || 0) - applied);
        }
    },
    getCharacterExpMultiplier: function() {
        const e = skills.getSkillEffect("hindsight");
        const hog = skills.getSkillEffect("experienceHog");
        const hindsight = e.characterExpMultiplier !== undefined ? e.characterExpMultiplier : 1;
        const hogMult = hog.characterExpMultiplier !== undefined ? hog.characterExpMultiplier : 1;
        // Hindsight and Experience Hog multiply; Soul remains an additive bonus on the product.
        return hindsight * hogMult + 0.10 * engine.getCloneSoulLevel();
    },
    getValidationAudFromKills: function() {
        if (!skills.isSkillUnlocked("validation")) {
            return 0;
        }
        const eff = skills.getSkillEffect("validation");
        const per = eff.audPerKill || 1;
        const cap = eff.audCap || 0;
        return Math.min((data.battle.enemiesKilled || 0) * per, cap);
    },
    /** True when the latest kill raised Validation's max-Aud contribution (still under the per-level cap). */
    didValidationMaxAudIncreaseOnLastKill: function() {
        if (!skills.isSkillUnlocked("validation")) {
            return false;
        }
        const eff = skills.getSkillEffect("validation");
        const per = eff.audPerKill || 1;
        const cap = eff.audCap || 0;
        const kills = data.battle.enemiesKilled || 0;
        if (kills <= 0 || cap <= 0 || per <= 0) {
            return false;
        }
        return Math.min(kills * per, cap) > Math.min((kills - 1) * per, cap);
    },
    getValidationCurrentAudOnMaxIncrease: function() {
        if (!skills.isSkillUnlocked("validation")) {
            return 0;
        }
        return skills.getSkillEffect("validation").currentAudOnMaxIncrease || 0;
    },
    /** Flat coin bonus from Nickel and Dime and More Coin Drop, excluding %/mult and zone base. */
    getKillCoinsFlatBonus: function() {
        const nickel = skills.getSkillEffect("nickelAndDime").killCoinsFlat || 0;
        const cardFlat = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().killCoinsFlatAdd || 0) : 0;
        return nickel + cardFlat;
    },
    /**
     * Secondhand Embarrassment: other slap-range intruders pay (splash fraction of base coins + flat coin bonuses),
     * then the full coin multiplier. Each splash is its own grantBattleCoins call so coin-gain triggers fire per drop.
     * Returns total coins granted (0 if none).
     */
    applySecondhandEmbarrassmentCoins: function(killedIntruder) {
        if (!skills.isSkillUnlocked("secondhandEmbarrassment")) {
            return 0;
        }
        const frac = skills.getSkillEffect("secondhandEmbarrassment").splashCoinFraction || 0;
        if (!(frac > 0)) {
            return 0;
        }
        const flat = skillEngine.getKillCoinsFlatBonus();
        const mult = engine.intruderCoinMultiplier();
        const killedId = killedIntruder && killedIntruder.id;
        let total = 0;
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const e = data.battle.enemies[i];
            if (!e.alive || !e.inRange || e.id === killedId) {
                continue;
            }
            const drop = (((e.gain || 1) * frac) + flat) * mult;
            if (drop > 0) {
                engine.noteCoinSplashFlat();
                engine.grantBattleCoins(drop);
                total += drop;
            }
        }
        return total;
    },
    getMainCharacterFlatDamage: function() {
        if (!skills.isSkillUnlocked("mainCharacter")) {
            return 0;
        }
        const eff = skills.getSkillEffect("mainCharacter");
        const per = eff.flatDamagePerEnemy || 0;
        return per * engine.countVisibleIntruders();
    },
    getPeerPressureDamageBonusFraction: function() {
        if (!skills.isSkillUnlocked("peerPressure")) {
            return 0;
        }
        const per = skills.getSkillEffect("peerPressure").damageBonusFractionPerEnemy || 0;
        if (!(per > 0)) {
            return 0;
        }
        return per * engine.countVisibleIntrudersCloserThan(200);
    },
    getRepeatOffenderFlatDamage: function(target) {
        if (!target || !skills.isSkillUnlocked("repeatOffender")) {
            return 0;
        }
        const priorHits = target.timesHitByPlayer || 0;
        if (priorHits <= 0) {
            return 0;
        }
        const eff = skills.getSkillEffect("repeatOffender");
        return priorHits * (eff.flatDamagePerPriorHit || 0);
    },
    getSadismFlatDamage: function() {
        if (!skills.isSkillUnlocked("sadism")) {
            return 0;
        }
        return skills.getSkillEffect("sadism").flatDamage || 0;
    },
    getSlowBurnFlatDamage: function() {
        if (!skills.isSkillUnlocked("slowBurn")) {
            return 0;
        }
        const secs = data.battle.slowBurnSeconds || 0;
        if (secs <= 0) {
            return 0;
        }
        const per = skills.getSkillEffect("slowBurn").flatDamagePerSecond || 0;
        return per * secs;
    },
    /** Flat ego damage added after density and before Brutality (on top of Force already in attackDamage). */
    getCombatOutgoingFlatBonus: function(target, opts) {
        let flat = skillEngine.getMainCharacterFlatDamage() + skillEngine.getSadismFlatDamage()
            + skillEngine.getSlowBurnFlatDamage();
        if (target) {
            flat += skillEngine.getRepeatOffenderFlatDamage(target);
        }
        if (opts && opts.flatBonus) {
            flat += opts.flatBonus;
        }
        return flat;
    },
    applyPercentOutgoingBonus: function(damage, fraction) {
        if (!fraction) {
            return damage;
        }
        return damage * (1 + fraction);
    },
    applyHighHorseOutgoingMultiplier: function(damage) {
        if (!engine.isPlayerAtMaxAud() || !skills.isSkillUnlocked("highHorse")) {
            return damage;
        }
        const eff = skills.getSkillEffect("highHorse");
        return skillEngine.applyPercentOutgoingBonus(damage, eff.damageBonusFraction || 0);
    },
    applyUnderdogOutgoingMultiplier: function(damage) {
        if (engine.isPlayerAtMaxAud() || !skills.isSkillUnlocked("underdog")) {
            return damage;
        }
        const eff = skills.getSkillEffect("underdog");
        return skillEngine.applyPercentOutgoingBonus(damage, eff.damageBonusFraction || 0);
    },
    applyPeerPressureOutgoingMultiplier: function(damage) {
        return skillEngine.applyPercentOutgoingBonus(damage, skillEngine.getPeerPressureDamageBonusFraction());
    },
    getCrowdWorkDamageBonusFraction: function() {
        if (!skills.isSkillUnlocked("crowdWork")) {
            return 0;
        }
        const per = skills.getSkillEffect("crowdWork").damageBonusFractionPerEnemy || 0;
        if (!(per > 0)) {
            return 0;
        }
        return per * engine.countVisibleIntruders();
    },
    applyCrowdWorkOutgoingMultiplier: function(damage) {
        return skillEngine.applyPercentOutgoingBonus(damage, skillEngine.getCrowdWorkDamageBonusFraction());
    },
    applyMarathonEgoOutgoingMultiplier: function(damage) {
        if (!skills.isSkillUnlocked("marathonEgo")) {
            return damage;
        }
        const eff = skills.getSkillEffect("marathonEgo");
        const pct = eff.damagePercentPerTenSec || 0;
        if (pct <= 0) {
            return damage;
        }
        const tens = Math.floor((data.battle.cloneAliveMs || 0) / 10000);
        if (tens <= 0) {
            return damage;
        }
        return damage * (1 + (pct / 100) * tens);
    },
    applyClosingArgumentOutgoingMultiplier: function(damage, target) {
        if (!target || !skills.isSkillUnlocked("closingArgument")) {
            return damage;
        }
        if ((target.timesHitByPlayer || 0) <= 0) {
            return damage;
        }
        const eff = skills.getSkillEffect("closingArgument");
        return skillEngine.applyPercentOutgoingBonus(damage, eff.damageBonusFraction || 0);
    },
    addCombatOutgoingHitSkillExp: function(target, priorHits) {
        if (priorHits > 0) {
            skills.fireTrigger("onRepeatHit");
        }
    },
    applyGrudgeOutgoingMultiplier: function(damage, target) {
        if (!target || !target.hasAttackedPlayer || !skills.isSkillUnlocked("grudge")) {
            return damage;
        }
        const eff = skills.getSkillEffect("grudge");
        const mult = eff.damageMultPerLevel || 0;
        return damage * (1 + mult);
    },
    applyBitterRivalryOutgoingMultiplier: function(damage, target) {
        if (!target || !skills.isSkillUnlocked("bitterRivalry")) {
            return damage;
        }
        const secs = target.bitterRivalrySeconds || 0;
        if (secs <= 0) {
            return damage;
        }
        const eff = skills.getSkillEffect("bitterRivalry");
        const pct = eff.damagePercentPerSecond || 0;
        if (pct <= 0) {
            return damage;
        }
        return damage * (1 + (pct / 100) * secs);
    },
    /** Insult Fatigue flat reduction only; capped at 50% of raw attack damage (not post-Clout remaining). */
    applyInsultFatigueFlat: function(intruder, incoming, rawIncoming) {
        if (!skills.isSkillUnlocked("insultFatigue")) {
            return incoming;
        }
        const stacks = intruder.insultFatigueStacks || 0;
        if (stacks <= 0) {
            return incoming;
        }
        const eff = skills.getSkillEffect("insultFatigue");
        const flat = stacks * (eff.flatReductionPerStack || 0);
        const rawCap = Math.max(0, rawIncoming !== undefined ? rawIncoming : incoming) * 0.5;
        const reduction = Math.min(flat, rawCap);
        return Math.max(0, incoming - reduction);
    },
    applyNarcissismToMaxAudCurrentIncrease: function(currentAud, currentRise, maxAud) {
        if (!skills.isSkillUnlocked("narcissism") || currentRise <= 0) {
            return currentAud;
        }
        const eff = skills.getSkillEffect("narcissism");
        const bonusMult = eff.audGainMultPerLevel || 0;
        if (bonusMult > 0) {
            currentAud = Math.min(maxAud, currentAud + currentRise * bonusMult);
        }
        return currentAud;
    },
    applyCondescendCleave: function(primaryTarget, dealtDamage) {
        const clEff = skills.getSkillEffect("cleave");
        const splashFrac = clEff.splashFraction || 0;
        if (splashFrac <= 0 || dealtDamage <= 0) {
            return;
        }
        const splash = Math.max(1, Math.floor(dealtDamage * splashFrac));
        const toHit = [];
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const e = data.battle.enemies[i];
            if (!e.alive || !e.inRange || e.id === primaryTarget.id) {
                continue;
            }
            if (e.lane === primaryTarget.lane - 1 || e.lane === primaryTarget.lane + 1) {
                toHit.push(e);
            }
        }
        let behind = null;
        let bestDelta = Infinity;
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const e = data.battle.enemies[i];
            if (!e.alive || e.id === primaryTarget.id || e.lane !== primaryTarget.lane) {
                continue;
            }
            if (e.yPx < primaryTarget.yPx) {
                const d = primaryTarget.yPx - e.yPx;
                if (d < bestDelta) {
                    bestDelta = d;
                    behind = e;
                }
            }
        }
        if (behind) {
            toHit.push(behind);
        }
        for (let i = 0; i < toHit.length; i++) {
            const e = toHit[i];
            const audBeforeSplash = e.aud;
            e.aud -= splash;
            if (e.aud <= 0) {
                e.aud = 0;
                e.alive = false;
                if (data.battle.activeTargetId === e.id) {
                    data.battle.activeTargetId = null;
                }
                engine.removeIntruderFromSlapQueue(e.id);
                engine.onIntruderKilled(e, {
                    __OVERKILL__BoostKind: "slap",
                    overkillDamage: Math.max(0, splash - audBeforeSplash)
                });
            }
        }
    },
    updateRighteousRant: function(tickMs) {
        if (!skills.isSkillUnlocked("righteousRant")) {
            return;
        }
        if (!engine.isPlayerMovingForward()) {
            return;
        }
        if (data.battle.righteousRantAccMs === undefined || data.battle.righteousRantAccMs === null) {
            data.battle.righteousRantAccMs = 0;
        }
        data.battle.righteousRantAccMs += tickMs;
        while (data.battle.righteousRantAccMs >= 1000) {
            data.battle.righteousRantAccMs -= 1000;
            const amt = skills.getSkillEffect("righteousRant").outragePerSecond || 0;
            if (amt > 0) {
                engine.addOutrage(amt);
            }
        }
    },
    updateHeckled: function(tickMs) {
        if (!skills.isSkillUnlocked("heckled")) {
            return;
        }
        const closeCount = engine.countVisibleIntrudersCloserThan(200);
        if (closeCount <= 0) {
            return;
        }
        const sec = tickMs / 1000;
        const per = skills.getSkillEffect("heckled").outragePerEnemy || 0;
        if (per > 0) {
            engine.addOutrage(per * closeCount * sec);
        }
    },
    updateReflection: function(tickMs) {
        if (!skills.isSkillUnlocked("reflection")) {
            return;
        }
        const perSec = skills.getSkillEffect("reflection").expPerSec || 0;
        if (!(perSec > 0)) {
            return;
        }
        engine.grantCloneCharacterExp(perSec * (tickMs / 1000));
    },
    updateRubbernecking: function(tickMs) {
        if (!skills.isSkillUnlocked("rubbernecking")) {
            return;
        }
        const sec = tickMs / 1000;
        const frac = skills.getSkillEffect("rubbernecking").cloneExpFractionPerSec || 0;
        if (!(frac > 0) || !(sec > 0)) {
            return;
        }
        let exp = 0;
        const enemies = data.battle.enemies || [];
        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            if (!e.alive || !e.inRange) {
                continue;
            }
            const expBase = e.expBase !== undefined ? e.expBase : 1;
            exp += engine.expAwardFromIntruderExpBase(expBase) * frac;
        }
        const award = exp * sec;
        if (!(award > 0)) {
            return;
        }
        engine.addPendingOkamiExpFromClone(award);
        if (bonfire.isGrowthBlessingUnlocked()) {
            engine.addCloneLevelExp(award);
            engine.resolveLevelUps();
        }
    },
    updateRunningTab: function(tickMs) {
        if (!skills.isSkillUnlocked("runningTab")) {
            return;
        }
        const sec = tickMs / 1000;
        const frac = skills.getSkillEffect("runningTab").coinFractionPerSec || 0;
        if (!(frac > 0) || !(sec > 0)) {
            return;
        }
        const enemies = data.battle.enemies || [];
        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            if (!e.alive || !e.inRange) {
                continue;
            }
            const storedGain = e.gain !== undefined ? e.gain : 1;
            engine.noteCoinAwardSample(frac * sec, storedGain);
            const payout = engine.coinsAwardFromIntruderGain(storedGain);
            e.runningTabBank = (e.runningTabBank || 0) + payout * frac * sec;
        }
    },
    /** Pay a Running Tab bank without coin-gain skill triggers. Returns coins added. */
    payRunningTabBank: function(intruder) {
        if (!intruder) {
            return 0;
        }
        const bank = intruder.runningTabBank || 0;
        intruder.runningTabBank = 0;
        if (!(bank > 0)) {
            return 0;
        }
        data.progress.coins = (data.progress.coins || 0) + bank;
        if (data.battle) {
            data.battle.runCoinsFromKills = (data.battle.runCoinsFromKills || 0) + bank;
        }
        return bank;
    }
};
