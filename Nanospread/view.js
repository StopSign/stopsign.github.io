function View() {
    this.offsetx = 0;
    this.offsety = 0;
    this.backgroundGrid = document.getElementById('theBody');
    this.naniteGrid = document.getElementById('naniteGrid');
    this.dragSelectDiv = document.getElementById('dragSelectDiv');

    this.shiftRight = function() {
        this.offsetx += 50;
        this.updateOffset();
    };
    this.shiftLeft = function() {
        this.offsetx -= 50;
        this.updateOffset();
    };
    this.shiftUp = function() {
        this.offsety -= 50;
        this.updateOffset();
    };
    this.shiftDown = function() {
        this.offsety += 50;
        this.updateOffset();
    };
    this.updateOffset = function() {
        document.getElementById('naniteGridPosition').style.left = this.offsetx+'px';
        document.getElementById('naniteGridPosition').style.top = this.offsety+'px';
    };

    this.createGrid = function() {
        this.deleteGrid();
        this.grid = [];
        for(var col = 0; col < theGrid.length; col++) {
            this.grid[col] = [];
            for (var row = 0; row < theGrid[col].length; row++) {
                if(!theGrid[col][row]) {
                    continue;
                }
                var elem = document.createElement("div");
                var rowSize = 700 / 13;
                var rectStartX = col*rowSize + 30;
                var rectStartY = row*rowSize + 30;
                elem.innerHTML =
                    "<div class='naniteSquare' style='left:"+rectStartX+"px;top:"+rectStartY+"px;width:"+(rowSize-10)+"px;height:"+(rowSize-10)+"px;' onclick='clickedSquare("+col+","+row+")'>" +
                    "<div class='displayNum' id='displayNumcol"+col+"row"+row+"'></div>" +
                    "<div class='displayNum2' id='displayNum2col"+col+"row"+row+"'></div>" +
                    "<div class='directionDot' id='directionDotcol"+col+"row"+row+"'></div>" +
                    "<div class='directionArrowOuter' id='directionArrowOutercol"+col+"row"+row+"'></div>" +
                    "<div class='directionArrowInner' id='directionArrowInnercol"+col+"row"+row+"'></div>" +
                    "</div>";

                this.naniteGrid.appendChild(elem);
                this.grid[col][row] = elem.firstChild;
            }
        }
        this.recreateDerivs();
        this.update();
    };

    this.deleteGrid = function() {
        if(!this.grid) {
            return;
        }
        for(var col = 0; col < this.grid.length; col++) {
            for(var row = 0; row < this.grid[col].length; row++) {
                if(this.grid[col][row]) {
                    var parent = this.grid[col][row].parentElement;
                    parent.parentElement.removeChild(parent);
                }
            }
        }
    };

    this.backgroundGrid.onmousedown  = function(e) {
        if((e.which && e.which === 3) || (e.buttons && e.buttons === 2)) { //Right click
            rclickStartingPoint = {x:e.pageX, y:e.pageY};
            return;
        }
        startingDragPoint = {x:e.pageX - theView.offsetx - 8, y:e.pageY - theView.offsety};
        theView.dragSelectDiv.style.width = '2px';
        theView.dragSelectDiv.style.height = '2px';
        theView.dragSelectDiv.style.left = startingDragPoint.x+"px";
        theView.dragSelectDiv.style.top = startingDragPoint.y+"px";
        isDragging = true;
    };
    this.backgroundGrid.onmousemove = function(e) {
        if((e.which && e.which === 3) || (e.buttons && e.buttons === 2)) {
            var dragToPoint = {x:e.pageX, y:e.pageY};
            theView.offsetx += dragToPoint.x - rclickStartingPoint.x;
            theView.offsety += dragToPoint.y - rclickStartingPoint.y;
            theView.updateOffset();
            rclickStartingPoint = dragToPoint;
            return;
        }
        var currentPos = {x:e.pageX - theView.offsetx, y:e.pageY - theView.offsety};
        if(isDragging) {
            var distance = Math.sqrt(Math.pow(startingDragPoint.x - currentPos.x, 2) + Math.pow(startingDragPoint.y - currentPos.y, 2));
            if(distance < 20) {
                theView.dragSelectDiv.style.display = "none";
            } else {
                theView.dragSelectDiv.style.display = "block";
            }
        } else {
            return;
        }
        if(startingDragPoint.x > currentPos.x) {
            var leftX = currentPos.x;
            var rightX = startingDragPoint.x + 4;
        } else {
            leftX = startingDragPoint.x + 8;
            rightX = currentPos.x - 4;
        }
        if(startingDragPoint.y > currentPos.y) {
            var topY = currentPos.y;
            var bottomY = startingDragPoint.y;
        } else {
            topY = startingDragPoint.y;
            bottomY = currentPos.y;
        }
        if(theView.dragSelectDiv.style.display === "block") {
            theView.dragSelectDiv.style.top = (topY + theView.offsety)+"px";
            theView.dragSelectDiv.style.left = (leftX + theView.offsetx)+"px";
            theView.dragSelectDiv.style.width = (rightX - leftX)+"px";
            theView.dragSelectDiv.style.height = (bottomY - topY - 4)+"px";
        }

    };
    this.backgroundGrid.onmouseup  = function(e) {
        if((e.which && e.which === 3) || (e.buttons && e.buttons === 2)) {
            return;
        }
        document.getElementById('dragSelectDiv').style.display = 'none';
        isDragging = false;
        endingDragPoint = {x:(e.pageX - theView.offsetx), y:(e.pageY - theView.offsety)};
        var distance = Math.sqrt(Math.pow(startingDragPoint.x - endingDragPoint.x, 2) + Math.pow(startingDragPoint.y - endingDragPoint.y, 2));
        if(distance < 20) {
            return;
        }
        if(startingDragPoint.x > endingDragPoint.x) {
            var leftX = endingDragPoint.x;
            var rightX = startingDragPoint.x;
        } else {
            leftX = startingDragPoint.x;
            rightX = endingDragPoint.x;
        }
        if(startingDragPoint.y > endingDragPoint.y) {
            var topY = endingDragPoint.y;
            var bottomY = startingDragPoint.y;
        } else {
            topY = startingDragPoint.y;
            bottomY = endingDragPoint.y;
        }
        select.selectAllInCoordinates({x:leftX, y:topY}, {x:rightX, y:bottomY});
    };

    this.drawButtons = function() {
        buttonSetup('nanite', 'Nanites', 'Nanites');
        buttonSetup('advBot', 'AdvBots', 'Adv Robots');
    };

    this.setSelectedFalse = function() {
        for(var i = 0; i < selected.length; i++) {
            selected[i].isSelected = 0;
            this.changeBorderSelected(selected[i]);
            this.updateDirectionArrow(selected[i]);
        }
        selected = [];
    };
    this.changeBorderColors = function() {
        for(var i = 0; i < selected.length; i++) {
            this.changeBorderSelected(selected[i]);
            this.updateDirectionArrow(selected[i]);
        }
        changeBordersOfLowest(this.grid);
    };
    this.changeBorderSelected = function(square) {
        var gridSquare = this.grid[square.col][square.row];
        if(square.isSelected) {
            gridSquare.style.border = "2px solid #ff9600";
        } else {
            gridSquare.style.border = square.isActive() ? "2px solid black" : "2px solid white";
        }
        this.updateDirectionArrow(square);
    };

    this.update = function() {
        for(var col = 0; col < theGrid.length; col++) {
            for (var row = 0; row < theGrid[col].length; row++) {
                var square = theGrid[col][row];
                if(!square) {
                    continue;
                }
                this.changeBorderSelected(square);
                this.changeBackground(square);
                this.updateDisplayNum(square, settings.selectedResourceNum === 0 ? 'nanite' : 'advBot');
                this.updateDirectionDot(square);
            }
        }
        this.updateGrowth();
        this.updateInfoBox();
        this.updateSettings();
        this.updateLevel();
		this.updateUpgrade();
		this.updateStats();
        this.updateEvolutionGain();
    };

    this.updateDirectionArrow = function(square, borderColor) {
        var directionArrowInner = document.getElementById('directionArrowInnercol'+square.col+'row'+square.row);
        var directionArrowOuter = document.getElementById('directionArrowOutercol'+square.col+'row'+square.row);
        if(!directionArrowInner) {
            return;
        }
        if(!borderColor) {
            borderColor = square.isSelected ? "#ff9600" : (square.isActive() ? "black" : "white");
        }
        var dir = square.transferDirection;
        var backgroundColor = getInactiveBackgroundColor(square.consumeCost);
        if(square.isActive()) {
            backgroundColor = getActiveBackgroundColor(square.nanites);
        }
        directionArrowOuter.className = "directionArrowOuter"+dir;
        directionArrowInner.className = "directionArrowInner"+dir;
        if(dir === "East") {
            directionArrowOuter.style.borderLeft = '7px solid '+borderColor;
            directionArrowInner.style.borderLeft = '7px solid '+backgroundColor;
        } else if(dir === "West") {
            directionArrowOuter.style.borderRight = '7px solid '+borderColor;
            directionArrowInner.style.borderRight = '7px solid '+backgroundColor;
        } else if(dir === "North") {
            directionArrowOuter.style.borderBottom = '7px solid '+borderColor;
            directionArrowInner.style.borderBottom = '7px solid '+backgroundColor;
        } else if(dir === "South") {
            directionArrowOuter.style.borderTop = '7px solid '+borderColor;
            directionArrowInner.style.borderTop = '7px solid '+backgroundColor;
        }
    };

    this.updateDirectionDot = function(square) {
        var directionDot = document.getElementById('directionDotcol'+square.col+'row'+square.row);
        if(!directionDot) {
            return;
        }

        var dir = square.transferDirection;
        if(dir === "East") {
            directionDot.style.top = '22px';
            directionDot.style.left = '39px';
        } else if(dir === "West") {
            directionDot.style.top = '22px';
            directionDot.style.left = '3px';
        } else if(dir === "North") {
            directionDot.style.top = '3px';
            directionDot.style.left = '22px';
        } else if(dir === "South") {
            directionDot.style.top = '39px';
            directionDot.style.left = '22px';
        }

    };

    this.updateDisplayNum = function(square, resourceType) {
        var displayNum = document.getElementById('displayNumcol'+square.col+'row'+square.row);
        var secondDisplayNum = document.getElementById('displayNum2col'+square.col+'row'+square.row);
        if(!displayNum) {
            return;
        }
        displayNum.style.marginTop = "36%";
        secondDisplayNum.style.display = "none";
        if(settings.selectShowNoneOrNanitesOrAmount === 0) {
            displayNum.innerHTML = '';
        } else if(settings.selectShowNoneOrNanitesOrAmount === 1) {
            if(square.isActive()) {
                displayNum.innerHTML = intToStringRound(square[resourceType+'s']);
            } else {
                displayNum.innerHTML = intToStringRound(square.consumeCost);
            }
        } else if(settings.selectShowNoneOrNanitesOrAmount === 2) {
            if(square.isActive()) {
                displayNum.innerHTML = intToStringRound(square[resourceType+'Amount']);
            } else {
                displayNum.innerHTML = intToStringRound(square.consumeCost);
            }
        } else {
            secondDisplayNum.style.display = "block";
            if(square.isActive()) {
                displayNum.style.marginTop = "23%";
                displayNum.innerHTML = intToStringRound(square[resourceType+'s']);
                secondDisplayNum.innerHTML = "("+intToStringRound(square[resourceType+'Amount'])+")";
            } else {
                displayNum.innerHTML = intToStringRound(square.consumeCost);
            }
        }

        if(settings.selectGridFont === 0) { //default
            if (displayNum.classList.contains('hyperVisible') ) {
                displayNum.classList.toggle('hyperVisible');
                secondDisplayNum.classList.toggle('hyperVisible');
            }
            if(!square.isActive()) {
                displayNum.style.color = "white";
            } else {
                displayNum.style.color = "black";
            }
        } else {
            if (!displayNum.classList.contains('hyperVisible') ) {
                displayNum.classList.toggle('hyperVisible');
                secondDisplayNum.classList.toggle('hyperVisible');
            }

        }
    };

    this.changeBackground = function(square) {
        var gridSquare = this.grid[square.col][square.row];
        if(square.isActive()) {
            gridSquare.style.background = getActiveBackgroundColor(square.nanites);
            gridSquare.style.opacity = 1;
        } else {
            var temp = Math.log10(square.consumeCost)/13+.15;
            gridSquare.style.background = getInactiveBackgroundColor(square.consumeCost);
            gridSquare.style.opacity = temp > 1 ? 1 : temp;
        }
    };

    this.updateInfoBox = function() {
        if(selected.length === 0) {
            return;
        }
        this.changeBorderColors();
        showNanites();
        selectedActiveOrNot();
        drawDirectionArrow();
        this.drawButtons();
    };

    this.updateSettings = function() {
        if(settings.selectOneOrMultiple) {
            document.getElementById('selectMultiple').checked = "checked";
        } else {
            document.getElementById('selectOne').checked = "checked";
        }
        if(settings.buyLowestOrAll === 1) {
            document.getElementById('selectAllBuy').checked = "checked";
        } else if(settings.buyLowestOrAll === 0) {
            document.getElementById('selectBuyLowest').checked = "checked";
        } else {
            document.getElementById('selectBuyLowestEach').checked = "checked";
        }

        if(!settings.showLastOrLowest) {
            document.getElementById('selectLast').checked = "checked";
        } else {
            document.getElementById('selectLowest').checked = "checked";
        }
        if(!settings.selectAllOrLowestBorderColor) {
            document.getElementById('selectSameColor').checked = "checked";
        } else {
            document.getElementById('selectLowestColor').checked = "checked";
        }
        if(settings.selectShowNoneOrNanitesOrAmount === 0) {
            document.getElementById('selectShowNone').checked = "checked";
        } else if(settings.selectShowNoneOrNanitesOrAmount === 1) {
            document.getElementById('selectShowNanites').checked = "checked";
        } else if(settings.selectShowNoneOrNanitesOrAmount === 2) {
            document.getElementById('selectShowUpgradeAmount').checked = "checked";
        } else {
            document.getElementById('selectShowBoth').checked = "checked";
        }

        if(settings.selectGridFont === 0) { //
            document.getElementById('selectFontDefault').checked = "checked";
        } else {
            document.getElementById('selectFontHyperVisible').checked = "checked";
        }

    };

    this.updateLevel = function() {
        document.getElementById('previousLevelButton').style.borderColor = 'yellow';
        document.getElementById('nextLevelButton').style.borderColor = 'yellow';
        document.getElementById('resetLevelButton').style.borderColor = 'yellow';
        if(document.getElementById('levelConfirm').checked) {
            document.getElementById('previousLevelButton').style.borderColor = 'green';
            document.getElementById('nextLevelButton').style.borderColor = 'green';
            document.getElementById('resetLevelButton').style.borderColor = 'green';
        }
        if(currentLevel === 0) {
            document.getElementById('previousLevelButton').style.borderColor = 'red';
        }
        if(currentLevel === highestLevel) {
            document.getElementById('nextLevelButton').style.borderColor = 'red';
        }
        document.getElementById('currentLevel').innerHTML = currentLevel;
    };

    this.updateEvolutionGain = function() {
        document.getElementById('evolutionGain').innerHTML = intToString(calcEvolutionPointGain());
        document.getElementById('evolutionPoints').innerHTML = intToString(bonuses.points);
    };

	this.updateUpgrade = function() {
        if(bonuses.tickSpeedLevel >= 5) {
            document.getElementById('buyTickSpeedButton').style.borderColor = 'grey';
        } else if(bonuses.availableEP >= getTickSpeedCost()) {
            document.getElementById('buyTickSpeedButton').style.borderColor = 'green';
        } else {
			document.getElementById('buyTickSpeedButton').style.borderColor = 'red';
		}

        if(bonuses.transferRateLevel >= 10) {
            document.getElementById('buyTransferRateButton').style.borderColor = 'grey';
        } else if(bonuses.availableEP >= getTransferRateCost()) {
            document.getElementById('buyTransferRateButton').style.borderColor = 'green';
        } else {
			document.getElementById('buyTransferRateButton').style.borderColor = 'red';
		}

		if(bonuses.availableEP >= getDiscountCost()) {
            document.getElementById('buyDiscountButton').style.borderColor = 'green';
        } else {
			document.getElementById('buyDiscountButton').style.borderColor = 'red';
		}

		if(autobuy.currentMax >= highestLevel * 5) {
            document.getElementById('buyAbMaxButton').style.borderColor = 'grey';
        } else if(bonuses.availableEP >= getAbMaxCost()) {
            document.getElementById('buyAbMaxButton').style.borderColor = 'green';
        } else {
			document.getElementById('buyAbMaxButton').style.borderColor = 'red';
		}

		if(autobuy.amtToSpend >= 100) {
            document.getElementById('buyAbAmtToSpendButton').style.borderColor = 'grey';
        } else if(bonuses.availableEP >= getAbAmtToSpendCost()) {
            document.getElementById('buyAbAmtToSpendButton').style.borderColor = 'green';
        } else {
			document.getElementById('buyAbAmtToSpendButton').style.borderColor = 'red';
		}

        if(autobuy.currentMax > 1) { //bought a single autobuy upgrade
            document.getElementById('autobuyContainer').style.display = "inline-block";
        } else {
            document.getElementById('autobuyContainer').style.display = "none";
        }

        document.getElementById('currentEP').innerHTML = intToString(bonuses.availableEP);
        document.getElementById('currentTickSpeed').innerHTML = intToString(bonuses.tickSpeedLevel);
        document.getElementById('buyTickSpeedCost').innerHTML = intToString(getTickSpeedCost());
        document.getElementById('buyTickSpeedCostN').innerHTML = intToString(getTickSpeedCost(bonuses.tickSpeedLevel+.2));
        document.getElementById('currentTransferRate').innerHTML = intToString(bonuses.transferRateLevel / 100);
        document.getElementById('buyTransferRateCost').innerHTML = intToString(getTransferRateCost());
        document.getElementById('buyTransferRateCostN').innerHTML = intToString(getTransferRateCost(bonuses.transferRateLevel+1));
		document.getElementById('nextDiscountBonus').innerHTML = intToString((getCostReduction(bonuses.discountLevel + 1) - getCostReduction(bonuses.discountLevel)) * 100);
        document.getElementById('currentDiscountBonus').innerHTML = intToString((getCostReduction(bonuses.discountLevel) - 1) * 100);
		document.getElementById('buyDiscountCost').innerHTML = intToString(getDiscountCost());
        document.getElementById('buyDiscountCostN').innerHTML = intToString(getDiscountCost(bonuses.discountLevel+1));
		document.getElementById('abCurrentMax').innerHTML = intToString(autobuy.currentMax);
        document.getElementById('abMaxMax').innerHTML = intToString(highestLevel * 5);
        document.getElementById('buyAbMaxCost').innerHTML = intToString(getAbMaxCost());
        document.getElementById('buyAbMaxCostN').innerHTML = intToString(getAbMaxCost(autobuy.currentMax+1));
        document.getElementById('abAmtToSpendLevel').innerHTML = intToString(autobuy.amtToSpend);
		document.getElementById('buyAbAmtToSpendCost').innerHTML = intToString(getAbAmtToSpendCost());
        document.getElementById('buyAbAmtToSpendCostN').innerHTML = intToString(getAbAmtToSpendCost(autobuy.amtToSpend+1));
    };
	this.updateStats = function() {
		document.getElementById('totalAchievementBonus').innerHTML = intToString(calcTotalAchieveBonus());
        document.getElementById('ticksThisLevel').innerHTML = intToString(stats.ticksThisLevel);
		document.getElementById('highestTicks').innerHTML = intToString(stats.highestTicks);
		document.getElementById('highestTicksAchNextLvl').innerHTML = intToString(nextAchieveLevelGoal(achieves.highestTicksAch));
		document.getElementById('highestTicksAchLvl').innerHTML = intToString(achieves.highestTicksAch);
		document.getElementById('highestTicksAchBonus').innerHTML = intToString(calcAchieveBonus(achieves.highestTicksAch));
        document.getElementById('totalTicks').innerHTML = intToString(stats.totalTicks);
		document.getElementById('totalTicksAchNextLvl').innerHTML = intToString(nextAchieveLevelGoal(achieves.totalTicksAch));
		document.getElementById('totalTicksAchLvl').innerHTML = intToString(achieves.totalTicksAch);
		document.getElementById('totalTicksAchBonus').innerHTML = intToString(calcAchieveBonus(achieves.totalTicksAch));
		document.getElementById('averageTicks').innerHTML = intToString(stats.totalTicks / stats.totalLevels);
        document.getElementById('nanobotsProducedThisLevel').innerHTML = intToString(stats.producedThisLevel);
		document.getElementById('highestProduced').innerHTML = intToString(stats.highestProduced);
		document.getElementById('highestProducedAchNextLvl').innerHTML = intToString(nextAchieveLevelGoal(achieves.highestProducedAch));
		document.getElementById('highestProducedAchLvl').innerHTML = intToString(achieves.highestProducedAch);
		document.getElementById('highestProducedAchBonus').innerHTML = intToString(calcAchieveBonus(achieves.highestProducedAch));
        document.getElementById('totalProducedNanobots').innerHTML = intToString(stats.totalProduced);
		document.getElementById('totalProducedAchNextLvl').innerHTML = intToString(nextAchieveLevelGoal(achieves.totalProducedAch));
		document.getElementById('totalProducedAchLvl').innerHTML = intToString(achieves.totalProducedAch);
		document.getElementById('totalProducedAchBonus').innerHTML = intToString(calcAchieveBonus(achieves.totalProducedAch));
		document.getElementById('averageProduced').innerHTML = intToString(stats.totalProduced / stats.totalLevels);
        document.getElementById('nanobotsTransferredThisLevel').innerHTML = intToString(stats.transferredThisLevel);
		document.getElementById('highestTransferred').innerHTML = intToString(stats.highestTransferred);
		document.getElementById('highestTransferredAchNextLvl').innerHTML = intToString(nextAchieveLevelGoal(achieves.highestTransferredAch));
		document.getElementById('highestTransferredAchLvl').innerHTML = intToString(achieves.highestTransferredAch);
		document.getElementById('highestTransferredAchBonus').innerHTML = intToString(calcAchieveBonus(achieves.highestTransferredAch));
		document.getElementById('totalTransferredNanobots').innerHTML = intToString(stats.totalTransferred);
		document.getElementById('totalTransferredAchNextLvl').innerHTML = intToString(nextAchieveLevelGoal(achieves.totalTransferredAch));
		document.getElementById('totalTransferredAchLvl').innerHTML = intToString(achieves.totalTransferredAch);
		document.getElementById('totalTransferredAchBonus').innerHTML = intToString(calcAchieveBonus(achieves.totalTransferredAch));
		document.getElementById('averageTransferred').innerHTML = intToString(stats.totalTransferred / stats.totalLevels);
		document.getElementById('highestLevel').innerHTML = intToString(highestLevel);
		document.getElementById('highestLevelAchNextLvl').innerHTML = intToString((achieves.highestLevelAch + 1) *10);
		document.getElementById('highestLevelAchLvl').innerHTML = intToString(achieves.highestLevelAch);
		document.getElementById('highestLevelAchBonus').innerHTML = intToString(calcAchieveBonus(achieves.highestLevelAch));
		document.getElementById('totalLevels').innerHTML = intToString(stats.totalLevels);
		document.getElementById('totalLevelsAchNextLvl').innerHTML = intToString((achieves.totalLevelsAch + 1) *10);
		document.getElementById('totalLevelsAchLvl').innerHTML = intToString(achieves.totalLevelsAch);
		document.getElementById('totalLevelsAchBonus').innerHTML = intToString(calcAchieveBonus(achieves.totalLevelsAch));
		document.getElementById('totalEP').innerHTML = intToString(bonuses.points);
		document.getElementById('epBonus').innerHTML = intToString(bonuses.points * 5);
		document.getElementById('availableEP').innerHTML = intToString(bonuses.availableEP);
		document.getElementById('averageEPPerLevel').innerHTML = intToString(bonuses.points / stats.totalLevels);
    };
	this.updateGrowth = function() {
        for(var x = 0; x < bonuses.derivs.length; x++) {
            var deriv = bonuses.derivs[x];
            var derivGain = deriv.amount * Math.pow(2, deriv.upgradeAmount);
            document.getElementById('deriv'+x+'Gain').innerHTML = intToString(x === 0 ? derivGain / 100 : derivGain);
            document.getElementById(x+'DerivInner').style.width = ((deriv.currentTicks+1) / deriv.ticksNeeded * 100) + '%';
        }

        if(bonuses.availableEP >= calcCostForNextDeriv()) {
            document.getElementById('unlockNextDerivButton').style.borderColor = 'green';
        } else {
            document.getElementById('unlockNextDerivButton').style.borderColor = 'red';
        }

        document.getElementById('growthBonus').innerHTML = intToString(bonuses.growthBonus, 5);
    };

	this.derivNames = ['Neurons', 'Neural Paths', 'Neural Nodes', 'Neural Groups', 'Neural Clusters', 'Neural Swarms',
        'Neural Nets', 'Neural Cities', 'Processors', 'Chips', 'Chipsets', 'Architectures', 'Computers',
        'Supercomputers', 'Computer Clusters', 'Logical AI', 'Chained AI', 'Subservient AI', 'Sentient AI',
        'Singularities'];

	this.recreateDerivs = function() {
	    //Dynamically create all divs and their buy buttons
        document.getElementById('derivCost').innerHTML = intToString(calcCostForNextDeriv());
        var parentElem = document.getElementById('autoGenDerivs');
        while (parentElem.firstChild) {
            parentElem.removeChild(parentElem.firstChild);
        }

        for(var x = 0; x < bonuses.derivs.length; x++) {
            if (x > this.derivNames.length) {
                break;
            }
            var prevName = "";
            if (x === 0) {
                prevName = "% added growth bonus";
            } else {
                prevName = " "+this.derivNames[x-1];
            }

            var labelName = this.derivNames[x];
            var ticksNeeded = bonuses.derivs[x].ticksNeeded;

            var elem = document.createElement("div");
            elem.innerHTML = '<div id="'+x+'Deriv" class="derivContainer">' +
                '<div class="derivLabel medium">'+labelName+'</div>' +
                '<div class="outerDerivBar"><div id="'+x+'DerivInner" class="innerDerivBar"></div></div>' +
                'Gain <div id="deriv'+x+'Gain">1</div>'+prevName+' per '+ticksNeeded+' ticks' +
                '</div>';

            parentElem.appendChild(elem);
        }
        this.updateGrowth();
    };


    this.createGrid(); //start using View
}


function getActiveBackgroundColor(nanites) {
    return colorShiftMath(360, Math.log10(nanites));
}
function getInactiveBackgroundColor(consumeCost) {
    if(consumeCost < 1e11) {
        return "hsl(120, 88%, 17%)";
    } else {
        var newColor = (Math.log10(consumeCost)-11)*10 + 120;
        return "hsl("+newColor+", 88%, 17%)";
    }

}

function buttonSetup(type, typeUpper, label) { //lol javascript
    var buyAvailableOr = selected[0]["canBuy"+typeUpper+"AfterMultiBuy"]() ? 1 : 0;
    var buyAvailableAnd = selected[0]["canBuy"+typeUpper+"AfterMultiBuy"]();
    var amount = selected[0][type+'Amount'];
    var lastSelected = selected[0];
    for(var i = 1; i < selected.length; i++) {
        if(selected[i][type+'Amount'] !== amount) {
            amount = -1;
        }
        lastSelected = selected[i];
        buyAvailableOr += selected[i]["canBuy"+typeUpper+"AfterMultiBuy"]() ? 1 : 0;
        buyAvailableAnd = buyAvailableAnd && selected[i]["canBuy"+typeUpper+"AfterMultiBuy"]();
    }
    var lowestSelected = selected.length > 1 ? select.getLowestSquare(select.getSelectedActive(), type) : selected[0];
    var displaySquare = settings.showLastOrLowest ? lowestSelected : lastSelected;
    if(!displaySquare) {
        return;
    }
    document.getElementById(type+'Amount').innerHTML = displaySquare[type+'Amount'];
    document.getElementById(type+'Cost').innerHTML = "Cost is: " + intToString(displaySquare[type+'CostAfterMultiBuy'](settings.buyPerClick))+", ";
    document.getElementById(type+'Benefit').innerHTML = "+"+ intToString(displaySquare[type+'AmountBonus']*getNaniteGainBonus()) +" created per, ";
    document.getElementById(type+'SpecialNext').innerHTML = "next Bonus at "+displaySquare[type+'NextSpecial']+".";
    document.getElementById('buy'+typeUpper+'Button').style.borderColor = buyAvailableAnd ? "green" : buyAvailableOr ? "yellow" : "red";
    document.getElementById('numSelected'+typeUpper+'ButtonBuyable').style.color = buyAvailableAnd ? "green" : buyAvailableOr ? "yellow" : "red";
    document.getElementById('numSelected'+typeUpper+'ButtonBuyable').innerHTML = buyAvailableOr + " / " + selected.length;
}

function drawDirectionArrow() {
    var arrows = [document.getElementById('leftArrow'), document.getElementById('rightArrow'), document.getElementById('upArrow'), document.getElementById('downArrow')];
    clearArrows(arrows);

    var dir = selected[0].transferDirection;
    for(var i = 0; i < selected.length; i++) {
        if(selected[i].transferDirection !== dir) {
            return; //just clear arrows if they're not all the same
        }
    }
    var arrowToChange = arrows[0];
    if(dir === "East") {
        arrowToChange = arrows[1];
    } else if(dir === "North") {
        arrowToChange = arrows[2];
    } else if(dir === "South") {
        arrowToChange = arrows[3];
    }
    arrowToChange.style.backgroundColor = "#ff9600";
}

function clearArrows(arrows) {
    for(var x = 0; x < arrows.length; x++) {
        arrows[x].style.backgroundColor = "transparent";
    }
}

function colorShiftMath(initialColor, multi, leftOverMulti) {
    //Hue is 0-360, 0 is red, 120 is green, 240 is blue. Sat is 0-100, 0=greyscale. Light is 0-100, 25=half black
    var hue = initialColor - (multi-1)*30; //- (leftOverMulti)*9;
    var sat = 10+Math.pow(multi, .8) * 2; //+ (leftOverMulti)*3
    sat = sat > 100 ? 100 : sat; //multi^.9 * 6 reaches at 23
    var light = 50;
    return "hsl("+hue+", "+sat+"%, "+light+"%)";
}

function changeBordersOfLowest(viewGrid) {
    if(!settings.selectAllOrLowestBorderColor || selected.length <= 1) {
        return;
    }
    var lowestSquares;
    if(settings.selectedResourceNum === 0) {
        lowestSquares = select.getLowestSquares(select.getSelectedActive(), 'nanite');
    } else {
        lowestSquares = select.getLowestSquares(select.getSelectedActive(), 'advBot');
    }
    for (var i = 0; i < lowestSquares.length; i++) {
        var gridSquare = viewGrid[lowestSquares[i].col][lowestSquares[i].row];
        if(lowestSquares[i].isSelected) {
            gridSquare.style.border = "2px solid blue";
            theView.updateDirectionArrow(lowestSquares[i], "blue");
        }
    }
}

function selectedSingleOrMultiple() {
    if(selected.length > 1) { //selected multiple
        document.getElementById('selectedTypeLabel').innerHTML = "Total";
        document.getElementById('infoGridAverage').style.display = 'inline-block';
        document.getElementById('infoGridLowest').style.display = 'inline-block';
    } else {
        document.getElementById('selectedTypeLabel').innerHTML = "Amount";
        document.getElementById('infoGridAverage').style.display = 'none';
        document.getElementById('infoGridLowest').style.display = 'none';
    }
}

function selectedActiveOrNot() {
    var selectedActiveAND = true;
    var selectedActiveOR = false;
    for(var i = 0; i < selected.length; i++) {
        var isActive = selected[i].isActive();
        selectedActiveAND = selectedActiveAND && isActive;
        selectedActiveOR = selectedActiveOR || isActive;
    }
    if(selectedActiveAND) {
        labelChange(true, false);
    } else if(selectedActiveOR) {
        labelChange(true, true);
    } else {
        labelChange(false, true);
    }
    selectedSingleOrMultiple()
}

function labelChange(isShowing, consumeShowing) {
    document.getElementById('totalLabel').style.display = isShowing ? "block" : "none";
    document.getElementById('totalTs').style.display = isShowing ? "block" : "none";
    document.getElementById('averageTs').style.display = isShowing ? "block" : "none";
    document.getElementById('lowestTs').style.display = isShowing || !consumeShowing ? "block" : "none";

    document.getElementById('createdLabel').style.display = isShowing ? "block" : "none";
    document.getElementById('totalTRate').style.display = isShowing ? "block" : "none";
    document.getElementById('averageTRate').style.display = isShowing ? "block" : "none";
    document.getElementById('lowestTRate').style.display = isShowing || !consumeShowing ? "block" : "none";

    document.getElementById('sentLabel').style.display = isShowing ? "block" : "none";
    document.getElementById('totalTTransferAmount').style.display = isShowing ? "block" : "none";
    document.getElementById('averageTTransferAmount').style.display = isShowing ? "block" : "none";
    document.getElementById('lowestTTransferAmount').style.display = isShowing || !consumeShowing ? "block" : "none";

    document.getElementById('transferRateLabel').style.display = isShowing ? "block" : "none";
    document.getElementById('totalTransferRate').style.display = isShowing ? "block" : "none";
    document.getElementById('averageTransferRate').style.display = isShowing ? "block" : "none";
    document.getElementById('lowestTransferRate').style.display = isShowing || !consumeShowing ? "block" : "none";

    document.getElementById('equilibriumLabel').style.display = isShowing ? "block" : "none";
    document.getElementById('totalTEquilibrium').style.display = isShowing ? "block" : "none";
    document.getElementById('averageTEquilibrium').style.display = isShowing ? "block" : "none";
    document.getElementById('lowestTEquilibrium').style.display = isShowing || !consumeShowing ? "block" : "none";

    document.getElementById('consumeCostLabel').style.display = consumeShowing ? "block" : "none";
    document.getElementById('totalConsumeCost').style.display = consumeShowing ? "block" : "none";
    document.getElementById('averageConsumeCost').style.display = consumeShowing ? "block" : "none";
    document.getElementById('lowestConsumeCost').style.display = consumeShowing ? "block" : "none";
}

function showNanites() {
    if(settings.selectedResourceNum === 0) {
        updateInfoGrid('Nanites', 'nanite');
    } else if(settings.selectedResourceNum === 1) {
        updateInfoGrid('Advanced Robots', 'advBot');
    }

    updateInfoGridExtras();
}

function updateInfoGridExtras() {
    var totalTransferRate = 0;
    for(var i = 0; i < selected.length; i++) {
        totalTransferRate += (selected[i].transferRate/100);
    }
    var inactiveList = select.getSelectedInactive();
    var totalConsumeCost = 0;
    for(i = 0; i < inactiveList.length; i++) {
        totalConsumeCost += inactiveList[i].consumeCost;
    }
    var lowestInactive = select.getLowestInactiveSquare(inactiveList);

    document.getElementById('totalTransferRate').innerHTML = intToString(totalTransferRate);
    document.getElementById('averageTransferRate').innerHTML = intToString(totalTransferRate / selected.length);

    document.getElementById('totalConsumeCost').innerHTML = intToString(totalConsumeCost);
    document.getElementById('averageConsumeCost').innerHTML = intToString(totalConsumeCost / inactiveList.length);
    if(lowestInactive) {
        document.getElementById('lowestConsumeCost').innerHTML = intToString(lowestInactive.consumeCost);
    }
}

function updateInfoGrid(label, varLabel) {
    var totalNanites = 0;
    var totalNaniteRate = 0;
    var totalNaniteTransferAmount = 0;
    var totalNaniteAmountReceived = 0;
    var totalConsumeCost = 0;
    var totalEquilibrium = 0;
    for(var i = 0; i < selected.length; i++) {
        totalNanites += selected[i][varLabel+'s'];
        totalNaniteRate += selected[i][varLabel+'Rate'];
        totalNaniteTransferAmount += selected[i][varLabel+'TransferAmount'];
        totalNaniteAmountReceived += selected[i][varLabel+'AmountReceived'];
        totalConsumeCost += selected[i].consumeCost;
        totalEquilibrium += (selected[i][varLabel + 'Rate'] * getNaniteGainBonus() + selected[i][varLabel + 'AmountReceived']) / selected[i].transferRate * 100;
    }
    totalNaniteRate *= getNaniteGainBonus();
    document.getElementById('resourceTypeLabel').innerHTML = label;
    document.getElementById('totalTs').innerHTML = intToString(totalNanites);
    document.getElementById('totalTRate').innerHTML = intToString(totalNaniteRate);
    document.getElementById('totalTTransferAmount').innerHTML = intToString(totalNaniteTransferAmount);
    document.getElementById('totalTAmountReceived').innerHTML = intToString(totalNaniteAmountReceived);
    document.getElementById('netTs').innerHTML = intToStringNegative(totalNaniteRate + totalNaniteAmountReceived - totalNaniteTransferAmount );
    document.getElementById('totalTEquilibrium').innerHTML = intToString(totalEquilibrium);

    if(selected.length > 1) {
        document.getElementById('averageTs').innerHTML = intToString(totalNanites / selected.length);
        document.getElementById('averageTRate').innerHTML = intToString(totalNaniteRate / selected.length);
        document.getElementById('averageTTransferAmount').innerHTML = intToString(totalNaniteTransferAmount / selected.length);
        document.getElementById('averageTAmountReceived').innerHTML = intToString(totalNaniteAmountReceived / selected.length);

        var lowestSquare = select.getLowestSquare(select.getSelectedActive(), varLabel);
        if(lowestSquare) {
            document.getElementById('lowestTs').innerHTML = intToString(lowestSquare[varLabel + 's']);
            document.getElementById('lowestNetTs').innerHTML = intToStringNegative((lowestSquare[varLabel + 'Rate'] * getNaniteGainBonus()) + lowestSquare[varLabel + 'AmountReceived'] - lowestSquare[varLabel + 'TransferAmount']);
            document.getElementById('lowestTRate').innerHTML = intToString(lowestSquare[varLabel + 'Rate'] * getNaniteGainBonus());
            document.getElementById('lowestTAmountReceived').innerHTML = intToString(lowestSquare[varLabel + 'AmountReceived']);
            document.getElementById('lowestTTransferAmount').innerHTML = intToString(lowestSquare[varLabel + 'TransferAmount']);
            document.getElementById('lowestTransferRate').innerHTML = intToString(lowestSquare.transferRate / 100);
            document.getElementById('lowestTEquilibrium').innerHTML = intToString((lowestSquare[varLabel + 'Rate'] * getNaniteGainBonus() + lowestSquare[varLabel + 'AmountReceived']) / lowestSquare.transferRate * 100);
            document.getElementById('lowestConsumeCost').innerHtml = intToString(lowestSquare.consumeCost);
        }
        var selectedInactive = select.getSelectedInactive();
        if(selectedInactive.length === selected.length) { //only selecting inactive
            var lowestInactive = select.getLowestInactiveSquare(selectedInactive);
            document.getElementById('lowestNetTs').innerHTML = intToStringNegative(lowestInactive[varLabel + 'Rate'] + lowestInactive[varLabel + 'AmountReceived'] - lowestInactive[varLabel + 'TransferAmount']);
            document.getElementById('lowestTAmountReceived').innerHTML = intToString(lowestInactive[varLabel + 'AmountReceived']);
            document.getElementById('lowestConsumeCost').innerHtml = intToString(lowestInactive.consumeCost);
        }

    }

}

function showOrHideBox() {
    if(selected.length === 0) {
        document.getElementById('infoPanel').style.display = "none";
        return true;
    }
    document.getElementById('infoPanel').style.display = "block";
}
