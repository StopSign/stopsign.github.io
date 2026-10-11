let keysPressed = {};

document.addEventListener("keydown", function(e) {
    const active = document.activeElement;
    if (active?.id?.includes('NumInput')) return;

    const code = e.code;

    if (code === "Escape" && typeof changelog !== "undefined" && changelog.isOpen && changelog.isOpen()) {
        changelog.close();
        return;
    }

    if (code === "Escape" && typeof toasts !== "undefined" && toasts.isPanelOpen && toasts.isPanelOpen()) {
        toasts.closePanel();
        return;
    }

    keysPressed[code] = true;
    keysPressed['shift'] = e.shiftKey;

    // if (code === 'Escape') {
    //     document.getElementById("helpMenu").style.display = "none";
    //     closeModal();
    // }

    if (code === 'Space') {
        if (typeof isDebug === "undefined" || !isDebug) {
            return;
        }
        if (data.gameSettings && data.gameSettings.prestigePackOpen) {
            return;
        }
        data.gameSettings.stop = !data.gameSettings.stop;
        saving.save();
    }


});
