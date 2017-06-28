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
    this.advBots = 0;
    this.advBotRate = 0;
    this.advBotCost = 10000;
    this.advBotAmount = 0;
    this.curSpecialPosAdvBots = 0;
    this.advBotAmountBonus = 1;
    this.advBotTransferAmount = 0;
    this.advBotAmountReceived = 0;
    this.consumeCost = initialConsumeCost;
    this.specialLevels = [0, 10, 25, 50, 75, 100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 1000];


    this.canBuyNanites = function() {
        return this.nanites >= this.naniteCost;
    };
    this.buyNanites = function() {
        this.nanites -= this.naniteCost;
        this.naniteAmount++;
        if (this.naniteAmount >= this.specialLevels[this.curSpecialPosNanites+1]) {
            this.naniteAmountBonus = Math.pow(2, (++this.curSpecialPosNanites));
        }
        var naniteCostExtra = Math.pow(3.333333, (this.curSpecialPosNanites));
        var amountShift = this.curSpecialPosNanites === 0 ? 0 : Math.floor(Math.pow((this.curSpecialPosNanites+1), 2));
        this.naniteCost = (this.naniteAmount - this.specialLevels[this.curSpecialPosNanites] + amountShift) * 10 * naniteCostExtra; //Math.ceil(Math.pow(1.2, this.naniteAmount)*10) * naniteCostExtra;
        this.naniteRate = this.naniteAmount * this.naniteAmountBonus;
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

    this.initializeIfConsumed = function() {
        if(this.consumeCost <= this.nanites) {
            this.nanites -= this.consumeCost;
            this.naniteAmount++;
            this.naniteRate++;
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
        this.targetRow = this.row;
        this.targetCol = this.col;
        this.changeTargetDirection("South");

        var target = theGrid[this.targetCol] ? theGrid[this.targetCol][this.targetRow] : false;
        if(!target) {
            this.changeTargetDirection("East");
            target = theGrid[this.targetCol] ? theGrid[this.targetCol][this.targetRow] : false;
        }
        if(!target) {
            this.changeTargetDirection("North");
            target = theGrid[this.targetCol] ? theGrid[this.targetCol][this.targetRow] : false;
        }
        if(!target) {
            this.changeTargetDirection("West");
        }

    };
    this.getTarget = function() {
        return theGrid[this.targetCol] ? theGrid[this.targetCol][this.targetRow] : null;
    };
}