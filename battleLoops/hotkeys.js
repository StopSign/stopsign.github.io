let keysPressed = {};

document.addEventListener("keydown", function(e) {
    const active = document.activeElement;
    if (active?.id?.includes('NumInput')) return;

    const code = e.code;

    keysPressed[code] = true;
    keysPressed['shift'] = e.shiftKey;

    // if (code === 'Escape') {
    //     document.getElementById("helpMenu").style.display = "none";
    //     closeModal();
    // }

    if (code === 'Space') {
        data.gameSettings.stop = !data.gameSettings.stop;
        saving.save();
    }


});
