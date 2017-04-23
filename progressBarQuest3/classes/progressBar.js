/**
 * Created by Jim on 4/23/2017.
 */

function ProgressBar(initialProgressReq, initialProgressRate, initialProgress, boostLimitInTicks, initialColorHue, gainAmount, row, name) {
    //parameter driven
    this.progressReq = initialProgressReq;
    this.progressRate = initialProgressRate;
    this.progress = initialProgress;
    this.initialColorHue = initialColorHue;
    this.row = row;
    this.resGain = gainAmount;
    this.name = name;
    this.boostLimitInTicks = boostLimitInTicks;

    //declarations
    this.exp = 0;
    this.level = 1;
    this.totalBoostTicks = 0;
    this.expGain = 1;
    this.expToNextLevel = 1;
    this.speedMult = 100;
    this.speedGainOpacity = 0;
    this.speedReduceMult = 1;
    this.resources=0;


    this.nextProgressDown = function(variantSpeedBonus, resultOfFinish) {
        var rateOfChange = this.progressRate * multFromFps * variantSpeedBonus * this.speedMult / 100 / Math.pow(10, this.speedReduceMult-1);
        if(this.totalBoostTicks > 0) {
            rateOfChange *= 2;
            this.isLeveling = true; //used to set the background
            this.totalBoostTicks--;
        } else {
            this.isLeveling = false;
        }
        while(rateOfChange > .5) {
            rateOfChange /= 10;
            this.speedReduceMult++
        }
        if(this.speedGainOpacity) {
            this.speedGainOpacity -= .025;
            if(this.speedGainOpacity < 0) {
                this.speedGainOpacity = 0;
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


    this.nextExp = function(secondsBoost) {
        this.exp += this.expGain*Math.pow(10, this.speedReduceMult-1); //EXP GAIN
        while(this.exp >= this.expToNextLevel) {
            this.exp -= this.expToNextLevel;
            this.expToNextLevel = Math.floor(Math.pow(1.4, ++this.level)); //EXP REQUIREMENTS
            this.color = colorShiftMath(this.initialColorHue, this.level, 0); //color based on level
            this.totalBoostTicks += secondsBoost * (1000/ msWaitTime);
        }
    };

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

    this.color = colorShiftMath(this.initialColorHue, this.level, 0);
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
    };
}


function boostDecayMath(num) {
    return Math.pow(1.5, num)*1.75
}
//multi is a whole, sequential integer. leftOverMulti is 0-1
function colorShiftMath(initialColor, multi, leftOverMulti) {
    //Hue is 0-360, 0 is red, 120 is green, 240 is blue. Sat is 0-100, 0=greyscale. Light is 0-100, 25=half black
    var hue = initialColor - (multi-1)*18; //- (leftOverMulti)*9;
    var sat = 10+Math.pow(multi, .95) * 4; //+ (leftOverMulti)*3
    sat = sat > 100 ? 100 : sat; //multi^.9 * 6 reaches at 23
    var light = 50;
    return "hsl("+hue+", "+sat+"%, "+light+"%)";
}