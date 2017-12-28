var canvas = document.getElementById("spaceCanvas");
var ctx = canvas.getContext("2d");
var xOffset = 200;

function updateSpace() {

    drawBattleships();
    drawTargets();
    drawBorders();
}

function drawBattleships() {

}

function drawTargets() {
    drawPlanet(100, 100)
}

function drawBorders() {
    ctx.fillStyle = "red";
    ctx.fillRect(200,0,800,10);
}

function drawPlanet(x, y) {
    var atmosphere = ctx.createRadialGradient(x+xOffset, y, 30, x+xOffset, y, 15);
    atmosphere.addColorStop(0, 'black');
    atmosphere.addColorStop(1, 'blue');
    ctx.fillStyle = atmosphere;
    ctx.fillRect(x+xOffset-30,y-30,60,60);

    ctx.beginPath();
    ctx.fillStyle="green";
    ctx.arc(x+xOffset,y,15,0,2*Math.PI);
    ctx.fill();
    // var gradient = ctx.createRadialGradient(300,100,100,300,100,0);
    // gradient.addColorStop(0,"black");
    // gradient.addColorStop(1,"blue");
    // ctx.fillStyle = gradient;
    // ctx.fillRect(200,0,400,200);
}