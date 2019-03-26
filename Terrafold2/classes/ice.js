window.iceData = {
    buyIce:function() {
        let amount = Number(document.getElementById("iceBuyAmount").value);
        if(amount <= 0) {
            return;
        }
        if(amount >= res.cash) {
            amount = res.cash;
        }
        res.ice += amount;
        res.cash -= amount;
    },
    tick: function() {
        let transfer = res.ice / 10000;
        res.ice -= transfer;
        addWaterTo("river_0", transfer);
    }
};