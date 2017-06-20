function Square(x,y,distanceFromCenter) {
    this.x = x;
    this.y = y;
    this.targetRow = 0;
    this.targetCol = 0;
    this.isHovered = 0;
    this.isSelected = 0;

    this.transferRate = .1;

    this.nanites = 0;
    this.naniteRate = 0;
    this.naniteCost = 10;
    this.naniteAmount = 0;
    this.naniteTransfRate = 0;
    this.advBots = 0;
    this.advBotRate = 0;
    this.advBotCost = 0;
    this.advBotAmount = 0;
    this.advBotTransfRate = 0;
    this.consumeCost = Math.pow(distanceFromCenter, 3);
    this.canBuyNanites = function() {
        return this.nanites >= this.naniteCost;
    };
    this.buyNanites = function() {
        this.nanites -= this.naniteCost;
        this.naniteAmount++;
        this.naniteCost = Math.ceil(Math.pow(1.2, this.naniteAmount)*10);
        this.naniteRate++;
    };
    this.canBuyAdvBots = function() {
        return this.nanites >= this.advBotCost;
    };
    this.buyAdvBots = function() {
        this.nanites -= this.advBotCost;
        this.advBotAmount++;
        this.advBotCost = 1000 + 500 * Math.pow((this.advBotAmount),2);
        this.advBotRate++;
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
        this.naniteTransfRate = this.nanites * this.transferRate / 100;
        this.nanites -= this.naniteTransfRate;
        return this.naniteTransfRate;
    };
    this.sendPieceOfAdvBots = function() {
        this.advBotTransfRate = Math.floor(this.advBots * this.transferRate / 100);
        this.advBots -= this.advBotTransfRate;
        return this.advBotTransfRate;
    };
    this.changeTargetDirection = function(newDirection) {
        if(newDirection === this.transferDirection) {
            return;
        }
        var tempCol = this.x;
        var tempRow = this.y;
        if(newDirection === "South" ) {
            tempRow = this.y + 1;
        } else if(newDirection === "East") {
            tempCol = this.x + 1;
        } else if(newDirection === "North" ) {
            tempRow = this.y - 1;
        } else if(newDirection === "West") {
            tempCol = this.x - 1;
        }
        this.targetRow = tempRow;
        this.targetCol = tempCol;
        this.transferDirection = newDirection;
    };
    this.chooseStartingDirection = function() {
        this.targetRow = this.y;
        this.targetCol = this.x;
        this.changeTargetDirection("South");

        var target = theGrid[this.targetRow] ? theGrid[this.targetRow][this.targetCol] : false;
        if(!target) {
            this.changeTargetDirection("East");
            target = theGrid[this.targetRow] ? theGrid[this.targetRow][this.targetCol] : false;
        }
        if(!target) {
            this.changeTargetDirection("North");
            target = theGrid[this.targetRow] ? theGrid[this.targetRow][this.targetCol] : false;
        }
        if(!target) {
            this.changeTargetDirection("West");
        }
    };
    this.getTarget = function() {
        if(this.isActive()) {
            return theGrid[this.targetCol][this.targetRow]
        } else {
            return null;
        }
    };
}