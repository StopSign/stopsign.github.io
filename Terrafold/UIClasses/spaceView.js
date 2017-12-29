var canvas = document.getElementById("spaceCanvas");
var ctx = canvas.getContext("2d");
var xOffset = 200;
var spacePlanets = [];

function newLevel() {
    for(var i = 0; i < 15; i++) {
        spacePlanets.push(new Planet());
    }
}

function updateSpace() {

    drawBattleships();
    drawTargets();
    drawBorders();
}

function drawBattleships() {

}

function drawTargets() {
    for(var i = 0; i < spacePlanets.length; i++) {
        drawPlanet(spacePlanets[i]);
    }
}

function drawBorders() {
    ctx.fillStyle = "red";
    ctx.fillRect(200,0,800,10);
}

function drawPlanet(planet) {
    var atmosphere = ctx.createRadialGradient(planet.x+xOffset, planet.y, 30, planet.x+xOffset, planet.y, 15);
    atmosphere.addColorStop(0, 'black');
    atmosphere.addColorStop(1, 'blue');
    ctx.fillStyle = atmosphere;
    ctx.fillRect(planet.x+xOffset-30,planet.y-30,60,60);

    ctx.beginPath();
    ctx.fillStyle="green";
    ctx.arc(planet.x+xOffset,planet.y,15,0,2*Math.PI);
    ctx.fill();

    drawPlanetShields(planet);
    drawPlanetHealth(planet);
    // var gradient = ctx.createRadialGradient(300,100,100,300,100,0);
    // gradient.addColorStop(0,"black");
    // gradient.addColorStop(1,"blue");
    // ctx.fillStyle = gradient;
    // ctx.fillRect(200,0,400,200);
}

function drawPlanetShields(planet) {
    ctx.beginPath();
    ctx.strokeStyle="#008080";
    ctx.lineWidth = 3;
    ctx.arc(planet.x+xOffset,planet.y,26,0,2*Math.PI * (planet.shields / planet.maxShields));
    ctx.stroke();
    // console.log(2*Math.PI * (planet.shields / planet.maxShields))
}

function drawPlanetHealth(planet) {
    ctx.beginPath();
    ctx.strokeStyle="#b6000b";
    ctx.lineWidth = 3;
    ctx.moveTo(planet.x - 20 + xOffset, planet.y - 30);
    ctx.lineTo(planet.x - 20 + (40 * (planet.health / planet.maxHealth)) + xOffset, planet.y - 30);
    // ctx.arc(planet.x+xOffset,planet.y,22,0,2*Math.PI * (planet.shields / planet.maxShields));
    ctx.stroke();
}