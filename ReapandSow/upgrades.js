function buyHunters() {
    let cost = res.hunterMax;
    if(res.vSouls >= cost) {
        res.vSouls -= cost;
        res.hunterMax++;
        document.getElementById("buyHunters").innerHTML = "Max hunters +1 ("+res.hunterMax+"/4).<br>Cost: "+res.hunterMax+" VSoul";
        if(res.hunterMax === 5) {
            document.getElementById("buyHunters").style.display = "none";
        }
        if(res.hunterMax === 3) {
            document.getElementById("buyFarmers").style.display = "inline-block";
        }
    }
}

function buyFarmers() {
    let cost = res.farmerMax + 5;
    if(res.vSouls >= cost) {
        res.vSouls -= cost;
        res.hunterMax++;
        document.getElementById("buyHunters").innerHTML = "Max hunters +1 ("+res.hunterMax+"/4).<br>Cost: "+res.hunterMax+" VSoul";
        if(res.hunterMax === 5) {
            document.getElementById("buyHunters").style.display = "none";
        }
    }
}