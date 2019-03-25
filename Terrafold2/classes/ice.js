window.iceData = {
    buyIce:function() {
        let amount = document.getElementById("iceBuyAmount").value - 0;
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