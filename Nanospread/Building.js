function Building(sideSize) {
    this.sideSize = sideSize;
    this.area = (this.sideSize)^2;
    this.mult = 1;
    this.canBuyMult = function() {
        if(true) {
            buyEffect();
        }
    };
    this.buyEffect = function() {
        this.mult = 0;
    };

}