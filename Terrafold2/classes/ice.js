window.iceData = {
    buyIce:function() {
        let amount = Number(document.getElementById("iceBuyAmount").value);
        if(amount <= 0) {
            return;
        }
        if(amount >= cash) {
            amount = cash;
        }
        ice += amount;
        cash -= amount;
    },
    tick: function() {
        let transfer = ice / 10000;
        ice -= transfer;
        addWaterTo("river_0", transfer);
    }
};