var canvas = document.getElementById("spaceCanvas");
var ctx = canvas.getContext("2d");
ctx.font = "11px Arial";
var xOffset = 200;
var mousePos = {};

canvas.addEventListener('mousemove', function(e) {
    mousePos = {x:e.offsetX - xOffset, y:e.offsetY};
});

function updateSpace() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBorders();
    drawTargets();
    drawBattleships();
    drawTooltips();
}

function drawTooltips() {
    for(var i = 0; i < game.space.planets.length; i++) {
        drawPlanetTooltip(game.space.planets[i]);
    }
}

function drawBattleships() {
    for(var i = 0; i < game.space.ships.length; i++) {
        drawShip(game.space.ships[i]);
    }
}

function drawTargets() {
    for(var i = 0; i < game.space.planets.length; i++) {
        var planet = game.space.planets[i];
        drawPlanet(planet, planet.isBoss ? "B" : i+1);
    }
}

function drawBorders() {
    ctx.fillStyle = "red";
    ctx.fillRect(200,0,800,10);
}

function drawShip(ship) {
    var offsetX = ship.x + 200;

    ctx.translate(offsetX+25, ship.y+25);
    ctx.rotate(ship.direction);

    var point1 = {x:-10, y:-10};
    var point2 = {x:10, y:0};
    var point3 = {x:-10, y:10};
    var point4 = {x:-7, y:0};

    ctx.beginPath();
    ctx.fillStyle="#008080";
    ctx.lineWidth = 3;
    ctx.moveTo(point1.x, point1.y);
    ctx.lineTo(point2.x, point2.y);
    ctx.lineTo(point3.x, point3.y);
    ctx.lineTo(point4.x, point4.y);
    // ctx.stroke();
    ctx.fill();
    ctx.rotate(-1*ship.direction);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.strokeText(ship.amount,-4,25);

    ctx.translate((offsetX+25)*-1, (ship.y+25)*-1);
}

function drawPlanet(planet, text) {
    var size = getPlanetSize(planet.isBoss);
    var offsetX = planet.x + xOffset;
    ctx.translate(offsetX+size, planet.y+size);

    var atmosphere = ctx.createRadialGradient(0, 0, size, 0, 0, size/2);
    atmosphere.addColorStop(0, 'black');
    atmosphere.addColorStop(1, 'blue');
    ctx.fillStyle = atmosphere;
    ctx.fillRect(-size,-size,size*2,size*2);

    ctx.beginPath();
    ctx.fillStyle="green";
    ctx.arc(0,0,size/2,0,2*Math.PI);
    ctx.fill();

    drawPlanetShields(planet, size);
    drawPlanetHealth(planet, size);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.strokeText(text,-3,4);

    ctx.translate((offsetX+size)*-1, (planet.y+size)*-1);
}

function drawPlanetTooltip(planet) {
    var size = getPlanetSize(planet.isBoss);
    var offsetX = planet.x + xOffset;

    planet.showTooltip = withinDistance(mousePos.x, mousePos.y, planet.x+size, planet.y+size, 50);
    if(!planet.showTooltip) {
        return;
    }

    ctx.translate(offsetX+size, planet.y+size);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.strokeText("Shields: " + intToString(planet.shields, 2),-15,size);
    ctx.strokeText("Reduction: "+intToString(planet.getShieldReduction()*100, 1)+"%",-15,size+10);
    ctx.strokeText("Health: "+intToString(planet.health, 2),-15,size+20);
    ctx.strokeText("Dirt: "+intToString(planet.dirt, 2),-15,size+30);

    ctx.translate((offsetX+size)*-1, (planet.y+size)*-1);
}

function drawPlanetShields(planet, size) {
    ctx.beginPath();
    ctx.strokeStyle="#008080";
    ctx.lineWidth = 3;
    ctx.arc(0,0,size-4,0,2*Math.PI * (planet.shields / planet.maxShields));
    ctx.stroke();
    // console.log(2*Math.PI * (planet.shields / planet.maxShields))
}

function drawPlanetHealth(planet, size) {
    ctx.beginPath();
    ctx.strokeStyle="#b6000b";
    ctx.lineWidth = 3;
    ctx.moveTo(-size*2/3, -size);
    ctx.lineTo(-size*2/3 + (size*4/3 * (planet.health / planet.maxHealth)), -size);
    // ctx.arc(planet.x+xOffset,planet.y,22,0,2*Math.PI * (planet.shields / planet.maxShields));
    ctx.stroke();
}

function getPlanetSize(isBoss) {
    return isBoss ? 40 : 25;
}