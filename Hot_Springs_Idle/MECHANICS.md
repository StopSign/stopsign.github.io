## 1. Game Engine & Strict Performance Rules
The game runs at 20 frames per second. **CRITICAL RULE: Game tick logic is strictly separated from UI frame rendering.** * **Time Skipping & Offline Progress:** Bonus time/paused time runs at 3x speed (3 logic ticks per 1 UI frame). Instant time-skips (e.g., 10 or 60 minutes) dynamically reduce `data.gameSettings.ticksPerSecond` from 20 to 1, then calculate the massive tick batch.
* **DOM Manipulation Constraints:**
    * **NEVER** use `getElementById()` or modify the DOM directly inside game logic or tick calculations.
    * **Creation:** New HTML elements must use `queueCache("<newId>")`. The UI builder processes the cache and stores elements globally.
    * **Continuous Updates (Per Frame/Second):** Use `views.updateVal(id, newVal, type="textContent", sigFigs)`. This function references the cached element and validates if `newVal` is different from the current state before touching the DOM.
    * **Event-Triggered Updates (During Ticks):** If game logic needs to update the UI instantly, use `views.ScheduleUpdate(id, newVal, type="textContent", sigFigs)`. This queues the update to be popped and rendered safely on the next UI frame.
    * Always be mindful of potential memory leaks - do not carelessly delete objects with listeners on them.

