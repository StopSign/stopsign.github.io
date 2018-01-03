var canvas = document.getElementById("spaceCanvas");
var ctx = canvas.getContext("2d");
var xOffset = 200;

function updateSpace() {
    drawBattleships();
    drawTargets();
    drawBorders();
}

function drawBattleships() {
    for(var i = 0; i < game.space.ships.length; i++) {
        drawShip(game.space.ships[i]);
    }
}

function drawTargets() {
    for(var i = 0; i < game.space.planets.length; i++) {
        drawPlanet(game.space.planets[i]);
    }
}

function drawBorders() {
    ctx.fillStyle = "red";
    ctx.fillRect(200,0,800,10);
}

function drawShip(ship) {
    var point1 = {x:ship.x, y:ship.y};
    var point2 = {x:ship.x+30, y:ship.y+15};
    var point3 = {x:ship.x, y:ship.y+30};
    var point4 = {x:ship.x+5, y:ship.y+15};

    ctx.beginPath();
    ctx.fillStyle="#008080";
    ctx.lineWidth = 3;
    ctx.moveTo(point1.x, point1.y);
    ctx.lineTo(point2.x, point2.y);
    ctx.lineTo(point3.x, point3.y);
    ctx.lineTo(point4.x, point4.y);
    // ctx.stroke();
    ctx.fill();
}

function drawPlanet(planet) {
    var size = planet.isBoss ? 40 : 25;
    var atmosphere = ctx.createRadialGradient(planet.x+xOffset, planet.y, size, planet.x+xOffset, planet.y, size/2);
    atmosphere.addColorStop(0, 'black');
    atmosphere.addColorStop(1, 'blue');
    ctx.fillStyle = atmosphere;
    ctx.fillRect(planet.x+xOffset-size,planet.y-size,size*2,size*2);

    ctx.beginPath();
    ctx.fillStyle="green";
    ctx.arc(planet.x+xOffset,planet.y,size/2,0,2*Math.PI);
    ctx.fill();

    drawPlanetShields(planet, size);
    drawPlanetHealth(planet, size);
    // var gradient = ctx.createRadialGradient(300,100,100,300,100,0);
    // gradient.addColorStop(0,"black");
    // gradient.addColorStop(1,"blue");
    // ctx.fillStyle = gradient;
    // ctx.fillRect(200,0,400,200);
}

function drawPlanetShields(planet, size) {
    ctx.beginPath();
    ctx.strokeStyle="#008080";
    ctx.lineWidth = 3;
    ctx.arc(planet.x+xOffset,planet.y,size-4,0,2*Math.PI * (planet.shields / planet.maxShields));
    ctx.stroke();
    // console.log(2*Math.PI * (planet.shields / planet.maxShields))
}

function drawPlanetHealth(planet, size) {
    ctx.beginPath();
    ctx.strokeStyle="#b6000b";
    ctx.lineWidth = 3;
    ctx.moveTo(planet.x - size*2/3 + xOffset, planet.y - size);
    ctx.lineTo(planet.x - size*2/3 + (size*4/3 * (planet.health / planet.maxHealth)) + xOffset, planet.y - size);
    // ctx.arc(planet.x+xOffset,planet.y,22,0,2*Math.PI * (planet.shields / planet.maxShields));
    ctx.stroke();
}