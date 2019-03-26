function clicked(funcName) {
    let parts = funcName.split(".");
    if(parts.length === 1) {
        window[parts[0]]();
    } else if(parts.length === 2) {
        window[parts[0]][parts[1]]();
    }
}

function changeBuyAmount() {
    let value = Number(document.getElementById("buyAmount").value);
    if(isNaN(value) || value < 0) {
        value = 0;
    }
    buyAmount = value;
    document.getElementById("buyAmount").value = value;
}