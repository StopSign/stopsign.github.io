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
            var rowSize = 25;
            var rectStartX = col*rowSize + this.offsetx + 50;
            var rectStartY = row*rowSize + this.offsety + 150;
            elem.innerHTML = "<div class='naniteSquare' style='left:"+rectStartX+"px;top:"+rectStartY+"px;' onclick='clickedSquare("+col+","+row+")'></div>";
            document.getElementById('naniteGrid').appendChild(elem);
            this.grid[col][row] = elem.firstChild;
        }
    }

    this.drawButtons = function() {
        buttonSetup('nanite', 'Nanites', 'Nanites');
        buttonSetup('advBot', 'AdvBots', 'Adv Robots');
    };

    this.selectedChange = function() {
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
        if(showOrHideBox()) {
            return;
        }
        showNanites();
        selectedSingleOrMultiple();
        drawDirectionArrow();
        this.drawButtons();
    };
}

function buttonSetup(type, typeUpper, label) { //lol javascript
    var buyAvailableOr = selected[0]["canBuy"+typeUpper]() ? 1 : 0;
    var buyAvailableAnd = selected[0]["canBuy"+typeUpper]();
    var amount = selected[0][type+'Amount'];
    var lastSelected = selected[0];
    for(var i = 1; i < selected.length; i++) {
        if(selected[i][type+'Amount'] !== amount) {
            amount = -1;
        }
        lastSelected = selected[i];
        buyAvailableOr += selected[i]["canBuy"+typeUpper]() ? 1 : 0;
        buyAvailableAnd = buyAvailableAnd && selected[i]["canBuy"+typeUpper]();
    }
    document.getElementById(type+'Amount').innerHTML = "#: "+lastSelected[type+'Amount'];
    // document.getElementById(type+'Amount').innerHTML = "#: " + (amount === -1 ? " " : amount) + ", ";
    document.getElementById(type+'Cost').innerHTML = "Cost is: " + intToStringRound(lastSelected[type+'Cost']);
    document.getElementById(type+'Benefit').innerHTML = ", Gain: +"+lastSelected[type+'AmountBonus']+" "+label+" per second.";
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
    } else {
        gridSquare.style.background = "grey";
    }
}

function colorShiftMath(initialColor, multi, leftOverMulti) {
    //Hue is 0-360, 0 is red, 120 is green, 240 is blue. Sat is 0-100, 0=greyscale. Light is 0-100, 25=half black
    var hue = initialColor - (multi-1)*30; //- (leftOverMulti)*9;
    var sat = 10+Math.pow(multi, .85) * 3; //+ (leftOverMulti)*3
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
        document.getElementById('totalNanitesLabel').innerHTML = "Total Nanites: ";
        document.getElementById('averageNanitesContainer').style.display = "block";
        document.getElementById('totalNaniteRateLabel').innerHTML = "Total Nanites Per Second: ";
        document.getElementById('averageNaniteRateContainer').style.display = "block";
        document.getElementById('totalNaniteTransferAmountLabel').innerHTML = "Total Nanites Sent: ";
        document.getElementById('averageNaniteTransferAmountContainer').style.display = "block";
        document.getElementById('totalNaniteAmountReceivedLabel').innerHTML = "Total Nanites Received: ";
        document.getElementById('averageNaniteAmountReceivedContainer').style.display = "block";
        document.getElementById('totalAdvBotsLabel').innerHTML = "Total Adv Robots: ";
        document.getElementById('averageAdvBotsContainer').style.display = "block";
        document.getElementById('totalAdvBotTransferAmountLabel').innerHTML = "Total Adv Robots Sent: ";
        document.getElementById('averageAdvBotTransferAmountContainer').style.display = "block";
        document.getElementById('totalAdvBotAmountReceivedLabel').innerHTML = "Total Adv Robots Received: ";
        document.getElementById('averageAdvBotAmountReceivedContainer').style.display = "block";

        document.getElementById('totalConsumeCostLabel').innerHTML = "Total Consume Cost: ";
    } else {
        document.getElementById('totalNanitesLabel').innerHTML = "Nanites: ";
        document.getElementById('averageNanitesContainer').style.display = "none";
        document.getElementById('totalNaniteRateLabel').innerHTML = "Nanites Per Second: ";
        document.getElementById('averageNaniteRateContainer').style.display = "none";
        document.getElementById('totalNaniteTransferAmountLabel').innerHTML = "Nanites Sent: ";
        document.getElementById('averageNaniteTransferAmountContainer').style.display = "none";
        document.getElementById('totalNaniteAmountReceivedLabel').innerHTML = "Nanites Received: ";
        document.getElementById('averageNaniteAmountReceivedContainer').style.display = "none";
        document.getElementById('totalAdvBotsLabel').innerHTML = "Adv Robots: ";
        document.getElementById('averageAdvBotsContainer').style.display = "none";
        document.getElementById('totalAdvBotRateLabel').innerHTML = "Adv Robots per Second: ";
        document.getElementById('averageAdvBotRateContainer').style.display = "none";
        document.getElementById('totalAdvBotTransferAmountLabel').innerHTML = "Adv Robots Sent: ";
        document.getElementById('averageAdvBotTransferAmountContainer').style.display = "none";
        document.getElementById('totalAdvBotAmountReceivedLabel').innerHTML = "Adv Robots Received: ";
        document.getElementById('averageAdvBotAmountReceivedContainer').style.display = "none";


        document.getElementById('totalConsumeCostLabel').innerHTML = "Consume Cost: ";
    }
}

function showNanites() {
    var totalNanites = 0;
    var totalNaniteRate = 0;
    var totalNaniteTransferAmount = 0;
    var totalNaniteAmountReceived = 0;
    var totalAdvBots = 0;
    var totalAdvBotRate = 0;
    var totalAdvBotTransferAmount = 0;
    var totalAdvBotAmountReceived = 0;

    var totalConsumeCost = 0;
    var transferRate = 0.1;
    for(var i = 0; i < selected.length; i++) {
        totalNanites += selected[i].nanites;
        totalNaniteRate += selected[i].naniteRate;
        totalNaniteTransferAmount += selected[i].naniteTransferAmount;
        totalNaniteAmountReceived += selected[i].naniteAmountReceived;
        totalAdvBots += selected[i].advBots;
        totalAdvBotRate += selected[i].advBotRate;
        totalAdvBotTransferAmount += selected[i].advBotRate;
        totalAdvBotAmountReceived += selected[i].advBotAmountReceived;

        totalConsumeCost += selected[i].consumeCost;
    }
    document.getElementById('totalNanites').innerHTML = intToString(totalNanites);
    document.getElementById('averageNanites').innerHTML = intToString(totalNanites / selected.length);
    document.getElementById('totalNaniteRate').innerHTML = intToString(totalNaniteRate);
    document.getElementById('averageNaniteRate').innerHTML = intToString(totalNaniteRate / selected.length);
    document.getElementById('totalNaniteTransferAmount').innerHTML = intToString(totalNaniteTransferAmount);
    document.getElementById('averageNaniteTransferAmount').innerHTML = intToString(totalNaniteTransferAmount / selected.length);
    document.getElementById('totalNaniteAmountReceived').innerHTML = intToString(totalNaniteAmountReceived);
    document.getElementById('averageNaniteAmountReceived').innerHTML = intToString(totalNaniteAmountReceived / selected.length);
    document.getElementById('totalAdvBots').innerHTML = intToString(totalAdvBots);
    document.getElementById('averageAdvBots').innerHTML = intToString(totalAdvBots / selected.length);
    document.getElementById('totalAdvBotRate').innerHTML = intToString(totalAdvBotRate);
    document.getElementById('averageAdvBotRate').innerHTML = intToString(totalAdvBotRate / selected.length);
    document.getElementById('totalAdvBotTransferAmount').innerHTML = intToString(totalAdvBotTransferAmount);
    document.getElementById('averageAdvBotTransferAmount').innerHTML = intToString(totalAdvBotTransferAmount / selected.length);
    document.getElementById('totalAdvBotAmountReceived').innerHTML = intToString(totalAdvBotAmountReceived);
    document.getElementById('averageAdvBotAmountReceived').innerHTML = intToString(totalAdvBotAmountReceived / selected.length);

    document.getElementById('transferRate').innerHTML = intToString(transferRate);
    document.getElementById('totalConsumeCost').innerHTML = intToString(totalConsumeCost);
    document.getElementById('totalConsumeCostContainer').style.display = totalConsumeCost !== 0 ? "block" : "none";
}

function showOrHideBox() {
    if(selected.length === 0) {
        document.getElementById('infoBox').style.display = "none";
        return true;
    }
    document.getElementById('infoBox').style.display = "block";
}
