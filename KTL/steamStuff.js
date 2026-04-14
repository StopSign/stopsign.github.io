

let isSweeping = false;

let emptySweepCount = parseInt(localStorage.getItem('emptySweepCount')) || 0;
let penaltyLevel = parseInt(localStorage.getItem('penaltyLevel')) || 0;
let lockoutEndTime = parseInt(localStorage.getItem('lockoutEndTime')) || 0;
const steamErrorLogStorageKey = "steamErrorLog";
let steamErrorLog = JSON.parse(localStorage.getItem(steamErrorLogStorageKey) || "[]");

function updateSteamErrorLogContainer() {
    const errorLogContainer = document.getElementById("errorLogContainer");
    if (!errorLogContainer) return;
    errorLogContainer.textContent = steamErrorLog.join("\n");
}

function addSteamErrorLog(errorMessage) {
    const time = new Date().toLocaleString();
    steamErrorLog.push(`[${time}] ${errorMessage}`);
    if (steamErrorLog.length > 30) {
        steamErrorLog = steamErrorLog.slice(-30);
    }
    localStorage.setItem(steamErrorLogStorageKey, JSON.stringify(steamErrorLog));
    updateSteamErrorLogContainer();
}

function updateOutput(message) {
    document.getElementById('shopOutputMessage').innerText = message;
}

function isUserLockedOut() {
    const now = Date.now();
    if (lockoutEndTime > now) {
        const minutesLeft = Math.ceil((lockoutEndTime - now) / 60000);
        updateOutput(`Too many empty requests. Please wait ${minutesLeft} minute(s).`);
        return true; // Still locked
    } else if (lockoutEndTime > 0) {
        lockoutEndTime = 0;
        localStorage.setItem('lockoutEndTime', 0);
    }
    return false;
}

// Triggered by the HTML button
function requestManualSweep() {
    if (isSweeping) return;
    if (isUserLockedOut()) return; // Block the Cloudflare ping entirely if penalized

    isSweeping = true;
    const btn = document.getElementById('refresh-purchases-btn');
    btn.disabled = true;
    updateOutput("Checking Steam for purchases...");
    try {
        window.steamAPI.forceSweep();
    } catch (e) {
        addSteamErrorLog(`requestManualSweep failed: ${e && e.message ? e.message : String(e)}`);
        updateOutput("Not in Steam");
    }
    refreshShopUpgrades()
}

if(window.steamAPI) {
    window.steamAPI.onPurchaseResult((result) => {
        const btn = document.getElementById('refresh-purchases-btn');
        const now = Date.now();

        if (result.success && result.consumedItems && result.consumedItems.length > 0) {
            emptySweepCount = 0;
            penaltyLevel = 0;
            localStorage.setItem('emptySweepCount', 0);
            localStorage.setItem('penaltyLevel', 0);

            let totalCoinsToAdd = 0;
            result.consumedItems.forEach(itemId => {
                if (itemId === 100) totalCoinsToAdd += 1000;
                if (itemId === 101) totalCoinsToAdd += 2200;
                if (itemId === 102) totalCoinsToAdd += 4800;
            });

            let currentTotalPurchased = parseInt(localStorage.getItem('totalPurchasedCoins')) || 0;
            localStorage.setItem('totalPurchasedCoins', currentTotalPurchased + totalCoinsToAdd);
            data.soulCoins += totalCoinsToAdd;
            data.totalBoughtSoulCoins += totalCoinsToAdd;

            updateOutput(`Success! +${totalCoinsToAdd} Soul Coins added to your account. It's recommended to export your save now!`);
            if(totalCoinsToAdd > 0) {
                refreshShopUpgrades()
                save()
            }

            setTimeout(() => {
                btn.disabled = false;
                isSweeping = false;
            }, 5000);

        } else if (result.error) {
            console.error('Sweep Error:', result.error);
            addSteamErrorLog(`Sweep Error: ${typeof result.error === "string" ? result.error : JSON.stringify(result.error)}`);
            updateOutput("Network error while checking Steam. Try again later.");
            setTimeout(() => {
                btn.disabled = false;
                isSweeping = false;
            }, 5000);

        } else {
            emptySweepCount++;
            localStorage.setItem('emptySweepCount', emptySweepCount);

            if (emptySweepCount >= 5) {
                if (penaltyLevel === 0) {
                    lockoutEndTime = now + (20 * 60 * 1000);
                    penaltyLevel = 1;
                    updateOutput("No purchases found. Spam protection active: Locked for 20 minutes.");
                } else {
                    lockoutEndTime = now + (4 * 60 * 60 * 1000);
                    penaltyLevel = 2;
                    updateOutput("No purchases found. Spam protection active: Locked for 4 hours.");
                }

                // Save the penalties and reset the immediate click counter
                localStorage.setItem('lockoutEndTime', lockoutEndTime);
                localStorage.setItem('penaltyLevel', penaltyLevel);
                emptySweepCount = 0;
                localStorage.setItem('emptySweepCount', 0);

                btn.disabled = false;
                isSweeping = false;

            } else {
                updateOutput(`Up to Date. No new purchases found. (${5 - emptySweepCount} attempts left before timeout)`);
                setTimeout(() => {
                    btn.disabled = false;
                    isSweeping = false;
                }, 5000);
            }
        }
    });
}