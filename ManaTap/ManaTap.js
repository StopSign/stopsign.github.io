

function tapTick() {
    data.timer++;
    if(data.timer > data.maxTimer) {
        data.timer = 0;
        data.gotMana = false;
    }
    if(data.timer / data.maxTimer > .9 && !data.gotMana) {
        growInitialBranch();
    }

}

function growInitialBranch() {

}