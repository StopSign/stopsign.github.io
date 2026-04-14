/**
 * Static definition for one action, stored on the global `actionData` object. {@link create} mutates and completes
 * the object (position, defaults), then {@link createAndLinkNewAction} builds runtime state in `data.actions[actionVar]`
 * via {@link actionSetInitialVariables} and {@link actionSetBaseVariables} in `engine.js`.
 *
 * Only a subset of actions use every field; optional hooks (`onCompleteCustom`, `updateMults`, …) are common for
 * generators and special cases.
 *
 * @typedef {Object} ActionDataDefinition
 *
 * @property {number} tier Progress / icon tier (0–3+). Used for icons, scaling, and tier multipliers.
 * @property {number} plane Which world tab the action belongs to (`0` Brythal … `3` Infusion).
 * @property {number} [creationVersion=0] Save/migration marker for this definition.
 *
 * @property {string} [resourceName="momentum"] Primary resource key for UI colors and labels (`momentum`, `coins`, `mana`, …).
 * @property {number} progressMaxBase Base bar size to fill for a level (non-generators); see {@link calcStatMult}.
 * @property {number} progressMaxIncrease Multiplier applied per level for `progressMaxBase` (engine uses with level).
 * @property {number} expToLevelBase Base experience required to level.
 * @property {number} expToLevelIncrease Growth factor for exp per level.
 * @property {number} [efficiencyBase=1] Expertise fraction before stats; `1` ⇒ 100% baseline for {@link actionObj.efficiency}.
 * @property {number} [efficiencyMult=1] Extra multiplier folded into expertise.
 * @property {number} [efficiencyIdeal] Target efficiency used by some balancing (e.g. Overclock line).
 * @property {number} maxLevel Maximum achievable level (`-1` or omitted means unbounded in some contexts).
 * @property {number} unlockCost Base cost to unlock; rescaled by upgrades / NG in {@link actionSetBaseVariables}.
 * @property {boolean|null} [visible] If `false`, hidden until revealed; `null`/`undefined` ⇒ treated as visible.
 * @property {boolean|null} [unlocked] Starting unlock state; `null` ⇒ defaults to unlocked in {@link actionSetBaseVariables}.
 * @property {boolean} [purchased] Whether the action is owned (affects UI, automation, …).
 * @property {boolean} [hasUpstream=true] If `true`, this action can receive upstream flow (default set in {@link create}).
 * @property {boolean} [keepParentAutomation] If `true`, parent automation UI can still apply when `hasUpstream` is false.
 * @property {boolean} [showResourceAdded] Show floating “resource added” readout when relevant.
 * @property {boolean} [backwardsEfficiency] If `true`, lower efficiency increases progress (used in views).
 *
 * @property {boolean} [isGenerator] If `true`, action is a generator (progress ticks, custom completion often adds resource).
 * @property {string} [generatorTarget] Downstream actionVar receiving generated output (e.g. `spendMoney`).
 * @property {number} [generatorSpeed] Ticks/s multiplier wired into generator `progressGain` in `updateMults`.
 * @property {number} [actionPowerBase] Base multiplier for generator output / power.
 * @property {number} [actionPowerMult] Runtime mult (often grows with levels).
 * @property {number} [actionPowerMultIncrease] Per-level growth for `actionPowerMult` where applicable.
 * @property {(resource:number) => number} [actionPowerFunction] Converts consumed resource into output (e.g. `makeMoney`).
 * @property {boolean} [ignoreExpUpgrade] If set with `isGenerator`, skips `extraGeneratorExp` amp in {@link actionSetBaseVariables}.
 *
 * @property {ActionAttPair[]} [onLevelAtts] Attributes granted on each level-up (`[attVar, amount]`).
 * @property {ActionAttPair[]} [expAtts] Attributes that scale **exp bar size** (generators: divides `expToLevel`).
 * @property {ActionAttPair[]} [efficiencyAtts] Attributes that scale **progress bar size** (non-generators) or speed.
 *
 * @property {function(): void} [onCompleteCustom] Called instead of default completion when present (generators, specials).
 * @property {function(): void} [onLevelCustom] Optional level-up hook.
 * @property {function(): void} [onUnlock] Called when action is unlocked.
 * @property {function(): void} [updateMults] Recompute `resourceToAdd`, `progressGain`, spell mults, etc. (`this` is usually this definition).
 * @property {function(): void} [updateUpgradeMult] Sub-hook to refresh shop/amulet multipliers into `data.actions[…].upgradeMult`.
 *
 * @property {Object<string, *>} [onCompleteText] Localized completion HTML; typically `{ english: TemplateResult|string }` from `Raw.html`.
 * @property {Object<string, *>} [extraInfo] Extra info panel HTML keyed by language.
 * @property {Object<string, string>} [unlockMessage] Plain unlock hint text (e.g. `{ english: "…" }`).
 * @property {Object<string, string>} [storyText] Long-form story; often filled from XML in `textData.js`.
 * @property {number} [storyVersion] Version of story text.
 *
 * @property {ActionTriggerRow[]} [actionTriggers] Machine-readable info/unlock/level lines for cards (defaults to `[]` in {@link create}).
 *
 * @property {number} [x] Pixel X after {@link create} (`gridX * 480`).
 * @property {number} [y] Pixel Y after {@link create} (`gridY * -480`).
 * @property {string} [title] Display name; default {@link decamelizeWithSpace}(actionVar) in {@link create}.
 * @property {number} [addedInVersion=0] Content-version stamp for unlock/reveal tooling.
 * @property {number} [blinkDelay] UI hint delay (initialized `0` in {@link create}).
 * @property {string[]} [downstreamVars] Downstream action keys; **set by** {@link createAndLinkNewAction}, not by hand.
 *
 * @property {number} [wage] Job wage for job actions; `>0` injects wage rows into `actionTriggers` in {@link create}.
 * @property {number} [cooldown] For cooldown-based actions (spells, etc.); copied in {@link actionSetInitialVariables}.
 * @property {number} [power] Optional static “power” copied to runtime `actionObj.power`.
 *
 * @property {boolean} [isSpell] Spell action (instability, spell UI, icons).
 * @property {boolean} [isSpellConsumer] Uses spell charges without being a full spell.
 * @property {number} [instabilityToAdd] Instability added per cast when `isSpell`.
 * @property {string} [school] Spell school label.
 * @property {number} [circle] Spell circle index.
 *
 * @property {boolean} [isKTL] Flag used in a few economy checks (e.g. shop) for KTL-only rules.
 * @property {() => number} [manaQuality] Optional getter for displayed mana quality.
 *
 * --- Many actions define additional ad hoc fields (`readStory`, `customTriggers`, job keys, etc.). ---
 */