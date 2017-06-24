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
        buttonSetup('nanite', 'Nanites');
        buttonSetup('advBot', 'AdvBots');
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

function buttonSetup(type, typeUpper) { //lol javascript
    var buyAvailableOr = selected[0]["canBuy"+typeUpper]();
    var buyAvailableAnd = selected[0]["canBuy"+typeUpper]();
    var amount = selected[0][type+'Amount'];
    for(var i = 0; i < selected.length; i++) {
        if(selected[i][type+'Amount'] !== amount) {
            amount = -1;
        }
        document.getElementById(type+'Amount').innerHTML = "#: "+selected[i][type+'Amount'];
        document.getElementById(type+'Cost').innerHTML = "Cost is: " + intToStringRound(selected[i][type+'Cost']);
        document.getElementById(type+'Benefit').innerHTML = "You will get +1 per buy";
        buyAvailableOr = buyAvailableOr || selected[i]["canBuy"+typeUpper]();
        buyAvailableAnd = buyAvailableAnd && selected[i]["canBuy"+typeUpper]();
    }
    document.getElementById(type+'Amount').innerHTML = "#: " + (amount === -1 ? " " : amount) + ", ";
    document.getElementById('buy'+typeUpper+'Button').style.borderColor = buyAvailableAnd ? "green" : buyAvailableOr ? "yellow" : "red";
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

function showOrHideConsumeCost(totalConsumeCost) {
    if(totalConsumeCost !== 0) {
        document.getElementById('totalConsumeCostContainer').style.display = "block";
    } else {
        document.getElementById('totalConsumeCostContainer').style.display = "none";
    }
}

function selectedSingleOrMultiple() {
    if(selected.length > 1) { //selected multiple
        document.getElementById('averageNanitesContainer').style.display = "block";
        document.getElementById('totalNanitesLabel').innerHTML = "Total Nanites: ";
        document.getElementById('totalConsumeCostLabel').innerHTML = "Total Consume Cost: ";
    } else {
        document.getElementById('averageNanitesContainer').style.display = "none";
        document.getElementById('totalNanitesLabel').innerHTML = "Nanites: ";
        document.getElementById('totalConsumeCostLabel').innerHTML = "Consume Cost: ";
    }
}

function showNanites() {
    var totalNanites = 0;
    var totalConsumeCost = 0;
    for(var i = 0; i < selected.length; i++) {
        totalNanites += selected[i].nanites;
        totalConsumeCost += selected[i].consumeCost;
    }
    document.getElementById('totalNanites').innerHTML = intToString(totalNanites);
    document.getElementById('averageNanites').innerHTML = intToString(totalNanites / selected.length);
    showOrHideConsumeCost(totalConsumeCost);
    document.getElementById('totalConsumeCost').innerHTML = intToString(totalConsumeCost);
}

function showOrHideBox() {
    if(selected.length === 0) {
        document.getElementById('infoBox').style.display = "none";
        return true;
    }
    document.getElementById('infoBox').style.display = "block";
}
