function clicked(funcName) {
    let parts = funcName.split(".");
    if(parts.length === 1) {
        window[parts[0]]();
    } else if(parts.length === 2) {
        window[parts[0]][parts[1]]();
    }
}
