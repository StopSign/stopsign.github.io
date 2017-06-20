function View() {
    this.offsetx = 0;
    this.offsety = 0;
    this.grid = [];
    for(var col = 0; col < theGrid.length; col++) {
        for (var row = 0; row < theGrid[col].length; row++) {

            var elem = document.createElement("div");
            var rowSize = 150;
            var rectStartX = col*rowSize*.8 + this.offsetx + 50;
            var rectStartY = row*rowSize + this.offsety + 150;
            elem.innerHTML = "<div class='naniteSquare' style='left:"+rectStartX+";top:"+rectStartY+";'></div>";
            document.getElementById('fightTime').appendChild(elem);
            this.grid[row][col] = elem;
        }
    }

    var canvas = document.getElementById('drawArea');
    var ctx = canvas.getContext("2d");
    ctx.font="12px Arial, Helvetica, serif";

    canvas.addEventListener('mousemove', function(evt) {
        var mousePos = getMousePos(canvas, evt);
        highlightHovered(canvas, mousePos);
    }, false);

    function highlightHovered(canvas, message) {

    }

    this.update = function() {

        ctx.fillStyle = "#918f86";
        ctx.fillRect(0,0,1000,800);

        for(var col = 0; col < theGrid.length; col++) {
            for(var row = 0; row < theGrid[col].length; row++) {
                var square = theGrid[col][row];
                if(!square) {
                    continue;
                }
                var rowSize = 150;
                var rectStartX = col*rowSize*.8 + this.offsetx + 50;
                var rectStartY = row*rowSize + this.offsety + 150;
                drawBorders(ctx, square, rowSize, rectStartX, rectStartY);
                if(!square.isActive()) {
                    writeConsumeCost(ctx, square, rowSize, rectStartX, rectStartY);
                } else {
                    writeNanites(ctx, square, rowSize, rectStartX, rectStartY);
                }
                createNaniteBuyButton(ctx, square, rowSize, rectStartX, rectStartY);
            }
        }


    }
}

function createNaniteBuyButton(ctx, square, rowSize, rectStartX, rectStartY) {

}

function writeConsumeCost(ctx, square, rowSize, rectStartX, rectStartY) {
    ctx.fillStyle = "#fafff8";
    ctx.fillText(intToString(square.consumeCost, 3),rectStartX+rowSize/3,rectStartY+rowSize/2);
}

function writeNanites(ctx, square, rowSize, rectStartX, rectStartY) {
    ctx.fillStyle = "#0b2928";
    ctx.fillText(intToString(square.nanites, 3),rectStartX+rowSize/3,rectStartY+rowSize/2);

}

function drawBorders(ctx, square, rowSize, rectStartX, rectStartY) {
    if(square.isActive()) {
        ctx.fillStyle = "rgba(61, 255, 255, .8)";
    } else {
        ctx.fillStyle = "rgba(6, 17, 17, .5)";
    }
    ctx.fillRect(rectStartX, rectStartY, 3, rowSize-3); //left border
    ctx.fillRect(rectStartX+rowSize*.8-6, rectStartY, 3, rowSize-3); //right border
    ctx.fillRect(rectStartX, rectStartY, rowSize*.8-3, 3); //north border
    ctx.fillRect(rectStartX, rectStartY+rowSize-6, rowSize*.8-3, 3); //south border
    if(!square.isActive()) {
        return;
    }
    ctx.fillStyle = "#ff7e03";
    var direction = square.transferDirection;
    if(direction === "South") {
        ctx.fillRect(rectStartX, rectStartY+rowSize-6, rowSize*.8-3, 3); //south border
    } else if(direction === "North") {
        ctx.fillRect(rectStartX, rectStartY, rowSize*.8-3, 3); //north border
    } else if(direction === "East") {
        ctx.fillRect(rectStartX+rowSize*.8-6, rectStartY, 3, rowSize-3); //right border
    } else if(direction === "West") {
        ctx.fillRect(rectStartX, rectStartY, 3, rowSize - 3); //left border
    }
}