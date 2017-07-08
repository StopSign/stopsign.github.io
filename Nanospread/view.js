function View() {
    this.offsetx = 0;
    this.offsety = 0;
    this.grid = [];

    for(var col = 0; col < theGrid.length; col++) {
        this.grid[col] = [];
        for (var row = 0; row < theGrid[col].length; row++) {
            if(!theGrid[col][row]) {
                continue;
            }
            var elem = document.createElement("div");
            var rowSize = 700 / 13;
            var rectStartX = col*rowSize + this.offsetx + 30;
            var rectStartY = row*rowSize + this.offsety + 30;
            elem.innerHTML = "<div class='naniteSquare' style='left:"+rectStartX+"px;top:"+rectStartY+"px;width:"+(rowSize-10)+"px;height:"+(rowSize-10)+"px;' onclick='clickedSquare("+col+","+row+")'></div>";
            document.getElementById('naniteGrid').appendChild(elem);
            this.grid[col][row] = elem.firstChild;
        }
    }

    this.drawButtons = function() {
        buttonSetup('nanite', 'Nanites', 'Nanites');
        buttonSetup('advBot', 'AdvBots', 'Adv Robots');
    };

    this.selectedChange = function() {
        showOrHideBox();
        for(var i = 0; i < selected.length; i++) {
            changeBorder(this.grid[selected[i].col][selected[i].row], selected[i]);
        }
        this.updateInfoBox();
    };

    this.update = function() {
        for(var col = 0; col < theGrid.length; col++) {
            for (var row = 0; row < theGrid[col].length; row++) {
                var square = theGrid[col][row];
                if(!square) {
                    continue;
                }
                changeBorder(this.grid[col][row], square);
                changeBackground(this.grid[col][row], square);
            }
        }
        this.updateInfoBox();
    };

    this.updateInfoBox = function() {
        if(selected.length === 0) {
            return;
        }
        showNanites();
        if(settings.selectedResourceNum === 0) {
            selectedSingleOrMultiple('Nanites');
        } else if(settings.selectedResourceNum === 1) {
            selectedSingleOrMultiple('AdvBots');
        }
        selectedActiveOrNot();
        drawDirectionArrow();
        this.drawButtons();
    };

    this.drawBuyPerClickButtons = function() {

    };
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
    document.getElementById(type+'Amount').innerHTML = lastSelected[type+'Amount'];
    // document.getElementById(type+'Amount').innerHTML = (amount === -1 ? " " : amount) + ", ";
    document.getElementById(type+'Cost').innerHTML = "Cost is: " + intToStringRound(lastSelected[type+'CostAfterMultiBuy'](settings.buyPerClick))+", ";
    document.getElementById(type+'Benefit').innerHTML = "Gain: +"+lastSelected[type+'AmountBonus']+" "+label+" per second, ";
    document.getElementById(type+'SpecialNext').innerHTML = "Next Bonus at "+lastSelected[type+'NextSpecial']+".";
    document.getElementById('buy'+typeUpper+'Button').style.borderColor = buyAvailableAnd ? "green" : buyAvailableOr ? "yellow" : "red";
    document.getElementById('numSelected'+typeUpper+'ButtonBuyable').style.color = buyAvailableAnd ? "green" : buyAvailableOr ? "yellow" : "red";
    document.getElementById('numSelected'+typeUpper+'ButtonBuyable').innerHTML = buyAvailableOr + " / " + selected.length;
}

function drawDirectionArrow() {
    var arrows = [document.getElementById('leftArrow'), document.getElementById('rightArrow'), document.getElementById('upArrow'), document.getElementById('downArrow')];
    var dir = selected[0].transferDirection;
    clearArrows(arrows);

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

function changeBackground(gridSquare, square) {
    if(square.isActive()) {
        gridSquare.style.background = colorShiftMath(360, Math.log10(square.nanites));
        gridSquare.style.opacity = 1;
    } else {
        var temp = Math.log10(square.consumeCost)/15+.2;
        gridSquare.style.background = "hsl(120, 88%, 13%)";
        gridSquare.style.opacity = temp > 1 ? 1 : temp;
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

function changeBorder(gridSquare, square) {
    if(square.isSelected) {
        gridSquare.style.border = "2px solid #ff9600";
    } else {
        gridSquare.style.border = square.isActive() ? "2px solid black" : "2px solid white";
    }
}

function selectedSingleOrMultiple() {
    if(selected.length > 1) { //selected multiple
        document.getElementById('selectedTypeLabel').innerHTML = "Total";
        document.getElementById('infoGridMult').style.display = 'inline-block';
        document.getElementById('totalTransferRate').style.display = 'none';
    } else {
        document.getElementById('selectedTypeLabel').innerHTML = "Amount";
        document.getElementById('infoGridMult').style.display = 'none';
        document.getElementById('totalTransferRate').style.display = 'block';
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
        document.getElementById('consumeCostLabel').style.display = "none";
        document.getElementById('totalConsumeCost').style.display = "none";
        document.getElementById('averageConsumeCost').style.display ="none";
        document.getElementById('totalLabel').style.display = "block";
        document.getElementById('createdLabel').style.display = "block";
        document.getElementById('sentLabel').style.display = "block";
        document.getElementById('transferRateLabel').style.display = "block";
    } else if(selectedActiveOR) {
        document.getElementById('totalLabel').style.display = "block";
        document.getElementById('createdLabel').style.display = "block";
        document.getElementById('sentLabel').style.display = "block";
        document.getElementById('transferRateLabel').style.display = "block";
        document.getElementById('consumeCostLabel').style.display = "block";
        document.getElementById('totalConsumeCost').style.display = "block";
        document.getElementById('averageConsumeCost').style.display ="block";
    } else if(!selectedActiveAND) {
        document.getElementById('totalLabel').style.display = "none";
        document.getElementById('createdLabel').style.display = "none";
        document.getElementById('sentLabel').style.display = "none";
        document.getElementById('transferRateLabel').style.display = "none";
        document.getElementById('consumeCostLabel').style.display = "block";
        document.getElementById('totalConsumeCost').style.display = "block";
        document.getElementById('averageConsumeCost').style.display ="block";
    }
}

function showNanites() {
    if(settings.selectedResourceNum === 0) {
        updateInfoGrid('Nanites', 'nanites', 'nanite');
    } else if(settings.selectedResourceNum === 1) {
        updateInfoGrid('Advanced Robots', 'advBots', 'advBot');
    }

    updateInfoGridExtras();
}

function updateInfoGridExtras() {
    var totalTransferRate = 0;
    var totalConsumeCost = 0;
    for(var i = 0; i < selected.length; i++) {
        totalTransferRate += (selected[i].transferRate/100);
        totalConsumeCost += selected[i].consumeCost;
    }
    document.getElementById('totalTransferRate').innerHTML = intToString(totalTransferRate);
    document.getElementById('averageTransferRate').innerHTML = intToString(totalTransferRate / selected.length);

    document.getElementById('totalConsumeCost').innerHTML = intToString(totalConsumeCost);
    document.getElementById('averageConsumeCost').innerHTML = intToString(totalConsumeCost / selected.length);
}

function updateInfoGrid(label, varLabel, varSingle) {
    var totalNanites = 0;
    var totalNaniteRate = 0;
    var totalNaniteTransferAmount = 0;
    var totalNaniteAmountReceived = 0;
    var totalConsumeCost = 0;
    for(var i = 0; i < selected.length; i++) {
        totalNanites += selected[i][varLabel];
        totalNaniteRate += selected[i][varSingle+'Rate'];
        totalNaniteTransferAmount += selected[i][varSingle+'TransferAmount'];
        totalNaniteAmountReceived += selected[i][varSingle+'AmountReceived'];
        totalConsumeCost += selected[i].consumeCost;
    }
    document.getElementById('resourceTypeLabel').innerHTML = label;
    document.getElementById('totalTs').innerHTML = intToString(totalNanites);
    document.getElementById('averageTs').innerHTML = intToString(totalNanites / selected.length);
    document.getElementById('totalTRate').innerHTML = intToString(totalNaniteRate);
    document.getElementById('averageTRate').innerHTML = intToString(totalNaniteRate / selected.length);
    document.getElementById('totalTTransferAmount').innerHTML = intToString(totalNaniteTransferAmount);
    document.getElementById('averageTTransferAmount').innerHTML = intToString(totalNaniteTransferAmount / selected.length);
    document.getElementById('totalTAmountReceived').innerHTML = intToString(totalNaniteAmountReceived);
    document.getElementById('averageTAmountReceived').innerHTML = intToString(totalNaniteAmountReceived / selected.length);
    document.getElementById('netTs').innerHTML = intToString(totalNaniteRate + totalNaniteAmountReceived - totalNaniteTransferAmount );
}

function showOrHideBox() {
    if(selected.length === 0) {
        document.getElementById('infoBox').style.display = "none";
        return true;
    }
    document.getElementById('settingsBox').style.display = "none";
    document.getElementById('infoBox').style.display = "block";
}
