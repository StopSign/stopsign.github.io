/**
 * Created by Jim on 4/23/2017.
 */

function ProgressBar(scope, initialProgressReq, initialProgress, gainAmount, row, name) {
    //parameter driven
    this.progressReq = initialProgressReq;
    this.progress = initialProgress;
    this.row = row;
    this.resGain = gainAmount;
    this.name = name;

    //declarations
    this.exp = 0;
    this.progressRate = 0.025;
    this.level = 1;
    this.totalBoostTicks = 0;
    this.expGain = 1;
    this.expToNextLevel = 1;
    this.speedMult = 100;
    this.resGainOpacity = 0;
    this.speedReduceMult = 1;
    this.resources=0;
    this.initialColorHue = 180;
    this.boostLimitInTicks = 6*(1000/ msWaitTime);
    this.speedMultFromLevel = 0;
    this.speedMultFromBuy = 1;

    this.speedInitialCost = 125;
    this.speedBought = 0;
    this.totalResGain = gainAmount;

    this.gainInitialCost = 3;
    this.gainBought = 0;

    this.gainMultInitialCost = [0, 200, 400, 700, 5000, 2000, 3500, 100000];
    this.gainMultAmount = [0, 0, 0, 0, 0, 0, 0, 0];
    this.gainMult = [1, 2, 2, 2, 3, 3, 3, 4];

    this.isSelected = [0, 0, 0, 0, 0];

    this.color = colorShiftMath(this.initialColorHue, this.level, 0);

    this.nextProgressDown = function(variantSpeedBonus, resultOfFinish) {
        var rateOfChange = this.progressRate * variantSpeedBonus * this.speedMult / 100 / Math.pow(10, this.speedReduceMult-1);
        while(rateOfChange > .4) {
            rateOfChange /= 10;
            this.speedReduceMult++
        }
        rateOfChange *= multFromFps;
        if(this.totalBoostTicks > 0) {
            rateOfChange *= 2;
            this.isLeveling = true; //used to set the background
            this.totalBoostTicks--;
        } else {
            this.isLeveling = false;
        }
        if(this.resGainOpacity) {
            this.resGainOpacity -= .015;
            if(this.resGainOpacity < 0) {
                this.resGainOpacity = 0;
            }
        }
        this.progress -= rateOfChange;

        while(this.progress <= 0) {
            this.progress += this.progressReq;
            resultOfFinish();
        }
    };

    this.nextProgressUp = function(variantSpeedBonus, resultOfFinish) {
        this.progress += this.progressRate * multFromFps * variantSpeedBonus;
        while(this.progress >= this.progressReq) {
            this.progress -= this.progressReq;
            resultOfFinish();
        }
    };


    this.nextExp = function(secondsLevelBoost) {
        this.exp += scope.expMult*Math.pow(10, this.speedReduceMult-1); //EXP GAIN
        while(this.exp >= this.expToNextLevel) {
            this.exp -= this.expToNextLevel;
            this.expToNextLevel = Math.floor(Math.pow(1.4, ++this.level)); //EXP REQUIREMENTS
            this.color = colorShiftMath(this.initialColorHue, this.level, 0); //color based on level
            this.totalBoostTicks += secondsLevelBoost * (1000/ msWaitTime);
            this.calcSpeedMult();
        }
    };

    this.buySpeed = function() {
        var speedCost = this.calcSpeedCost();
        if(this.resources >= speedCost) {
            this.resources -= speedCost;
            this.handleResourceChange();
            this.speedMultFromBuy = Math.pow(1.4, ++this.speedBought);
            this.calcSpeedMult();
            this.calcSpeedCost();
        }
    };
    this.calcSpeedCost = function() {
        return Math.floor(Math.pow(5, this.speedBought) * this.speedInitialCost);
    };

    //=((A1+4)^2-(A1+4))/2-10
    this.calcSpeedMult = function() {
        this.bonusFromLevel = (Math.pow(this.level+4, 2) - this.level + 4)/2 - 14;
        this.speedMult = Math.floor((100 + this.bonusFromLevel) * this.speedMultFromBuy);
    };

    this.buyGain = function() {
        var gainCost = this.calcGainCost();
        if(this.resources >= gainCost) {
            this.resources -= gainCost;
            this.gainBought++;
            this.resGain++;
            this.calcTotalResGain();
            this.handleResourceChange();
        }
    };
    this.calcGainCost = function() {
        return Math.floor(Math.pow(2, this.gainBought) * this.gainInitialCost);
    };

    this.buyGainMult = function(target) {
        var pbar = scope.pbars[scope.pbars.length - (this.row + target + 1)];
        if(!pbar) {
            return;
        }
        var difference = pbar.row - this.row;
        var multCost = this.calcGainMultCost(difference);
        if(pbar.resources >= multCost) {
            pbar.resources -= multCost;
            this.gainMultAmount[difference]++;
            this.calcTotalResGain();
            pbar.handleResourceChange();
        }
    };
    this.calcGainMultCost = function(difference) {
        // console.log(rowNum+", "+this.gainMultAmount[rowNum]+", "+this.gainMultInitialCost[rowNum]);
        return Math.floor(Math.pow(100, this.gainMultAmount[difference]) * this.gainMultInitialCost[difference]);
    };

    this.handleResourceChange = function() {
        if(this.resources instanceof String) {
            this.resources = 0;
        }
        this.speedBuyable = this.resources >= this.calcSpeedCost();
        this.gainBuyable = this.resources >= this.calcGainCost();
        for(var x = 0; x < this.gainMultAmount.length; x++) {
            if(x === 1 || x === 4 || x === 7 ) {
                var rowNum = (scope.pbars.length - this.row)+x-1;
                if(rowNum > 0) {
                    var pbar = scope.pbars[rowNum];
                    if(pbar) {
                        pbar["gainMultFrom"+x+"Buyable"] = this.resources >= pbar.calcGainMultCost(x);
                    }
                }
            }
        }
    };
    this.calcTotalResGain = function() {
        var totalMult = 1;
        for(var x = 0; x < this.gainMult.length; x++) {
            totalMult *= Math.pow(this.gainMult[x], this.gainMultAmount[x]);
        }
        this.totalResGain = this.resGain * Math.pow(10, this.speedReduceMult-1) * totalMult;
        return this.totalResGain;
    };

    this.changeSelect = function(num) {
        if(num === -1) {
            for(var x = 0; x < this.isSelected.length; x++) {
                this.isSelected[x] = false;
            }
        }
        if(num >= 0) {
            this.isSelected[num] = true;
            // console.log(this.row + ", " + num);
        }
    };

    this.clickButtonByColumn = function(num) {
        if(num === 0) {
            this.buySpeed();
        }
        if(num === 1) {
            this.buyGain();
        }
        if(num === 2) {
            this.buyGainMult(1);
        }
        if(num === 3) {
            this.buyGainMult(4);
        }
        if(num === 3) {
            this.buyGainMult(7);
        }
    }


    /*
    this.nextBoost = function() {
        if(this.totalBoostTicks > 0) {
            //convert the seconds of boost on this into the actual bonus
            var multiFromBoost = this.calcBoostBonus();
            this.totalBoostTicks -= Math.pow(2, multiFromBoost) * multFromFps;
            if(this.totalBoostTicks <= 0) {
                this.color = colorShiftMath(this.initialColorHue, 0, 0)
            }
            return boostDecayMath(multiFromBoost)
        }
        return 1
    };

    this.addBoost = function(secondsBoostChange) {
        this.totalBoostTicks += secondsBoostChange * (1000/ msWaitTime);
        return this.calcBoostBonus()
    };

    this.calcBoostBonus = function() {
        //TODO probably a fancier way to do this w/o looping
        //Takes the first 10 from totalBoostTicks at price X, then the next 10 at price 2X, the next 10 at 4X, etc.
        var tensOfSeconds = this.totalBoostTicks / this.boostLimitInTicks;
        var theMulti = Math.ceil(Math.log2(tensOfSeconds));
        if(theMulti < 1) {
            theMulti = 0
        }
        if(row === 0) {
            //console.log("1:"+Math.pow(2, theMulti)+" 2:"+tensOfSeconds+" 3:"+Math.pow(2, theMulti-1))
        }
        var leftOver = (tensOfSeconds - Math.pow(2, theMulti-1)) / Math.pow(2, theMulti-1); //theMulti - Math.log2(tensOfSeconds) was close but failed when tensOfSeconds was decimal
        theMulti++; //1 is 2x, 2 is 3x, 3 is 4.5x, etc.
        this.color = colorShiftMath(this.initialColorHue, theMulti, leftOver);
        if(this.row === 0) {
            //console.log(theMulti+" <-- multi.  leftOver: "+Math.floor(leftOver*100)+" color: "+this.color+" boost Limit: " + this.boostLimitInTicks+ " total Ticks "+this.totalBoostTicks )
        }
        return theMulti; //some boost
    };*/
}


function boostDecayMath(num) {
    return Math.pow(1.5, num)*1.75
}
//multi is a whole, sequential integer. leftOverMulti is 0-1
function colorShiftMath(initialColor, multi, leftOverMulti) {
    //Hue is 0-360, 0 is red, 120 is green, 240 is blue. Sat is 0-100, 0=greyscale. Light is 0-100, 25=half black
    var hue = initialColor - (multi-1)*9; //- (leftOverMulti)*9;
    var sat = 10+Math.pow(multi, .85) * 3; //+ (leftOverMulti)*3
    sat = sat > 100 ? 100 : sat; //multi^.9 * 6 reaches at 23
    var light = 50;
    return "hsl("+hue+", "+sat+"%, "+light+"%)";
}