# Kill the Lich - Architecture & Mechanics
**Game Type:** Long-term Idle Game (Months of progression).

## 1. Core Data Structure
The game strictly separates mutable state from static initial data.
* **Mutable State (`data` object):** Everything that changes and is saved. 
    * Dynamic action data is stored in `data.actions[actionVar]`.
    * *Naming Convention:* When iterating or referencing this in logic, always refer to it as `actionObj`.
* **Static Data (`actionData` object):** Initial variables and configurations that are never saved or modified.
    * Static action data is stored in `actionData[actionVar]`.
    * *Naming Convention:* When iterating or referencing this in logic, always refer to it as `dataObj`.

## 2. Core Gameplay Loop & Resource Flow
The entire game revolves around generating and routing resources downstream. All resources function identically once generated.
* **Generators:** Actions (like "Overclock") that generate a resource (like "momentum", money, or mana) over time.
* **Non-Generators:** Actions that consume the resource stored on them to gain EXP and level up, granting attributes.
* **Routing:** Every action holds its current resource in `actionObj.resource`. Each action has an `actionObj.downstreamVars` array containing downstream actions. The player dictates the percentage (0-100%) of resources sent to each downstream target.

## 3. The Prestige Hierarchy
The game features three distinct reset layers. Each layer handles variables across different "Planes" (tabs containing groups of actions) differently.

* **Layer 1: Amulet (Two-Stage KTL Mechanic)**
    * **Stage 1 (Trigger: `initializeKTL()`):** Transitions player to "Plane 2: Northern Wastes". Iterates through all actions; if an action's plane is NOT `2`, it sets `actionObj.isRunning = false`.
    * **Stage 2 (Trigger: `useAmulet()`):** The actual reset. Applies purchased upgrades, resets action states to base values, and restarts the loop.
* **Layer 2: Legacy Severance (Trigger: `legacySeveranceReset()`)**
    * Occurs roughly after 50 Amulet uses. Resets the Amulet layer completely, grants bonuses/unlocks, and increases global difficulty.
* **Layer 3: Genesis Reset / NG+ (Trigger: `genesisReset()`)**
    * Occurs after 3 Legacy Severances (~2 months of gameplay). Hard resets the entire game state, retaining only Genesis-specific upgrades. Grants a 1-3% global speed multiplier.

## 4. Game Engine & Strict Performance Rules
The game runs at 20 frames per second. **CRITICAL RULE: Game tick logic is strictly separated from UI frame rendering.** * **Time Skipping & Offline Progress:** Bonus time/paused time runs at 3x speed (3 logic ticks per 1 UI frame). Instant time-skips (e.g., 10 or 60 minutes) dynamically reduce `data.gameSettings.ticksPerSecond` from 20 to 1, then calculate the massive tick batch.
* **DOM Manipulation Constraints:**
    * **NEVER** use `getElementById()` or modify the DOM directly inside game logic or tick calculations.
    * **Creation:** New HTML elements must use `queueCache("<newId>")`. The UI builder processes the cache and stores elements globally.
    * **Continuous Updates (Per Frame/Second):** Use `views.updateVal(id, newVal, type="textContent", sigFigs)`. This function references the cached element and validates if `newVal` is different from the current state before touching the DOM.
    * **Event-Triggered Updates (During Ticks):** If game logic needs to update the UI instantly, use `views.ScheduleUpdate(id, newVal, type="textContent", sigFigs)`. This queues the update to be popped and rendered safely on the next UI frame.