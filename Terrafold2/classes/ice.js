window.iceData = {
    buyIce:function() {
        let amount = document.getElementById("iceBuyAmount").value - 0;
        if(amount >= 0 && cash >= amount) {
            ice += amount;
            console.log(ice);
            cash -= amount;
            totalWater += amount;
        }
    },
    tick: function() {
        let transfer = ice / 10000;
        ice -= transfer;
        getTarget("river_0").water += transfer;
    }
};