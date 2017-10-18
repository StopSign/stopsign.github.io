function Square(col,row,initialConsumeCost) {
    this.col = col;
    this.row = row;
    this.targetRow = 0;
    this.targetCol = 0;
    this.isHovered = 0;
    this.isSelected = 0;

    this.transferRate = 1;

    this.nanites = 0;
    this.naniteRate = 0;
    this.naniteCost = 10;
    this.naniteAmount = 0;
    this.curSpecialPosNanites = 0;
    this.naniteAmountBonus = 1;
    this.naniteTransferAmount = 0;
    this.naniteAmountReceived = 0;
    this.naniteNextSpecial = 10;
    this.advBots = 0;
    this.advBotRate = 0;
    this.advBotCost = 10000;
    this.advBotAmount = 0;
    this.curSpecialPosAdvBots = 0;
    this.advBotAmountBonus = 1;
    this.advBotTransferAmount = 0;
    this.advBotAmountReceived = 0;
    this.advBotNextSpecial = 10;
    this.consumeCost = initialConsumeCost;
    this.specialLevels = [0, 10, 25, 50, 75, 100, 125, 150, 175, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 775, 850, 925, 1000, 1075, 1150, 1225, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2200, 2400, 2600, 2800, 3000, 3300, 3600, 3900, 4200, 4500, 4800, 5200, 5600, 6000];


    this.buyNanites = function() {
        this.nanites -= this.naniteCost;
        this.naniteAmount++;
        if (this.naniteAmount >= this.specialLevels[this.curSpecialPosNanites+1]) {
            this.naniteAmountBonus = Math.pow(2, (++this.curSpecialPosNanites));
            this.naniteNextSpecial = this.specialLevels[this.curSpecialPosNanites+1]; //for graphics only
        }
        this.naniteCost = this.calcNaniteCost();
        this.naniteRate = this.naniteAmount * this.naniteAmountBonus;
    };

    this.calcNaniteCost = function(curSpecialPosNanites, naniteAmount) {
        if(!curSpecialPosNanites) { //javascript form of overloading a method
            curSpecialPosNanites = this.curSpecialPosNanites;
            naniteAmount = this.naniteAmount;
        }
        var naniteCostExtra = Math.pow(5, (curSpecialPosNanites));
        var amountShift = curSpecialPosNanites === 0 ? 0 : curSpecialPosNanites*3;
        return (naniteAmount - this.specialLevels[curSpecialPosNanites] + amountShift) * 10 * naniteCostExtra / getCostReduction(bonuses.discountLevel);
    };
    this.buyMultipleNanites = function(buyPerClick) {
        var num = settings.buyPerClick - this.naniteAmount % buyPerClick;
        for(var j = 0; j < num; j++) {
            this.buyNanites();
        }
    };
	this.autobuyMultipleNanites = function(autobuyPerTick) {
        var num = settings.autobuyPerTick - this.naniteAmount % autobuyPerTick;
        for(var j = 0; j < num; j++) {
            this.buyNanites();
        }
    };
    this.canBuyNanitesAfterMultiBuy = function() {
        return this.isActive() && this.nanites >= this.naniteCostAfterMultiBuy(settings.buyPerClick);
    };
    this.naniteCostAfterMultiBuy = function(amount) {
        var numToBuy = amount - this.naniteAmount % amount;

        var totalNaniteCost = 0;
        for(var i = 1; i < numToBuy+1; i++) {
            totalNaniteCost += this.calcPrice(i);
        }
        return totalNaniteCost;
    };
    this.calcPrice = function(num) {
        var nextNaniteCost = this.naniteCost;
        var tempNanites = this.nanites;
        var tempAmount = this.naniteAmount;
        var tempSpecialPos = this.curSpecialPosNanites;
        var tempNaniteAmountBonus = this.naniteAmountBonus;
        for(var i = 0; i < num-1; i++) {
            tempNanites -= nextNaniteCost;
            tempAmount++;
            if (tempAmount >= this.specialLevels[tempSpecialPos+1]) {
                tempNaniteAmountBonus = Math.pow(2, (++tempSpecialPos));
            }
            nextNaniteCost = this.calcNaniteCost(tempSpecialPos, tempAmount);
        }
        return nextNaniteCost;
    };

    this.canBuyAdvBots = function() {
        return this.nanites >= this.advBotCost;
    };
    this.buyAdvBots = function() {
        this.nanites -= this.advBotCost;
        this.advBotAmount++;
        if (this.advBotAmount >= this.specialLevels[this.curSpecialPosAdvBots]) {
            this.advBotAmountBonus = Math.pow(2, this.curSpecialPosAdvBots);
            this.curSpecialPosAdvBots++;
        }
        this.advBotCost = 10000 + 5000 * Math.pow(this.advBotAmount,2);
        this.advBotRate = this.advBotAmount * this.advBotAmountBonus;
    };
    this.canBuyAdvBotsAfterMultiBuy = function(num) {

    };
    this.advBotCostAfterMultiBuy = function(num) {

    };

    this.initializeIfConsumed = function() {
        if(this.consumeCost <= this.nanites) {
            this.nanites -= this.consumeCost;
            this.naniteAmount++;
            this.naniteRate++;
            this.naniteCost = this.calcNaniteCost();
        }
    };
    this.gainNanites = function(amount) {
        if(this.isActive()) {
            this.nanites+=amount;
            return this.nanites;
        } else {
            this.consumeCost -= amount;
            this.consumeCost = this.consumeCost < 0 ? 0 : this.consumeCost;
            this.initializeIfConsumed();
            return 0;
        }
    };
    this.gainAdvBots = function(amount) {
        if(this.isActive()) {
            this.advBots+=amount;
            return this.advBots;
        }
    };
    this.isActive = function() { return this.naniteAmount > 0; };
    this.sendPieceOfNanites = function() {
        this.naniteTransferAmount = this.nanites * this.transferRate / 100;
        this.nanites -= this.naniteTransferAmount;
        return this.naniteTransferAmount;
    };
    this.sendPieceOfAdvBots = function() {
        this.advBotTransferAmount = Math.floor(this.advBots * this.transferRate / 100);
        this.advBots -= this.advBotTransferAmount;
        return this.advBotTransferAmount;
    };
    this.changeTargetDirection = function(newDirection) {
        if(newDirection === this.transferDirection) {
            return;
        }
        var target = theGrid[this.targetCol] ? theGrid[this.targetCol][this.targetRow] : false;
        if(target) {
            target.naniteAmountReceived = 0;
            target.advBotAmountReceived = 0;
        }

        var tempCol = this.col;
        var tempRow = this.row;
        if(newDirection === "South" ) {
            tempRow = this.row + 1;
        } else if(newDirection === "East") {
            tempCol = this.col + 1;
        } else if(newDirection === "North" ) {
            tempRow = this.row - 1;
        } else if(newDirection === "West") {
            tempCol = this.col - 1;
        }
        this.targetRow = tempRow;
        this.targetCol = tempCol;
        this.transferDirection = newDirection;
    };
    this.chooseStartingDirection = function() {
        this.changeTargetDirection("South");
        if(!this.getTarget()) {
            this.changeTargetDirection("East");
        }
        if(!this.getTarget()) {
            this.changeTargetDirection("North");
        }
        if(!this.getTarget()) {
            this.changeTargetDirection("West");
        }

    };
    this.getTarget = function() {
        return theGrid[this.targetCol] ? theGrid[this.targetCol][this.targetRow] : null;
    };
}