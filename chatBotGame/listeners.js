

buyIceButton.addEventListener("click", () => {
    const incrementValue = parseInt(iceValueInput.value);
    if (data.money >= incrementValue) {
        data.ice += incrementValue;
        data.money -= incrementValue;
    } else {
        data.ice += data.money;
        data.money = 0;
    }
});

buyMaxIceButton.addEventListener("click", () => {
    data.ice += data.money;
    data.money = 0;
});

upgradePumpButton.addEventListener("click", () => {
    if (data.money >= 10) {
        data.pump += 1;
        data.money -= 10;
    }
});

sellWaterButton.addEventListener("click", () => {
    data.money += data.greatLake * 1.25;
    data.greatLake = 0;
});